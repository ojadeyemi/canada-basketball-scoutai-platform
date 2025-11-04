// Markdown setup
const setupMarked = () => {
  marked.setOptions({
    gfm: true,
    breaks: true,
  });
};

// Render markdown text
const renderMarkdown = (text) => {
  setupMarked();
  const markdownText = typeof text === "string" ? text : JSON.stringify(text);
  const responseDiv = document.createElement("div");
  responseDiv.classList.add("ai-response");
  responseDiv.innerHTML = marked.parse(markdownText);
  return responseDiv;
};

// Chat service module
const ChatService = {
  sessionId: `session_${Date.now()}`,

  async sendMessage(message, isResume = false, interruptType = null) {
    try {
      // Determine if message should be sent as boolean or string
      let messagePayload = message;

      // If message is explicitly true/false boolean, keep as boolean
      // Otherwise, send as string
      if (message === true || message === false) {
        messagePayload = message;
      }

      const response = await fetch("http://127.0.0.1:8000/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: messagePayload,
          session_id: this.sessionId,
          is_resume: isResume,
          interrupt_type: interruptType,
        }),
      });

      await this.processStream(response);
    } catch (error) {
      console.error("Error sending message:", error);
      UI.displayError("Could not connect to the server.");
    }
  },

  /** Processes streaming response using newline-delimited JSON */
  async processStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    try {
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf("\n");

          while (boundary !== -1) {
            const chunk = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 1);
            boundary = buffer.indexOf("\n");

            if (chunk) {
              try {
                const data = JSON.parse(chunk);
                UI.handleNodeOutput(data);
              } catch (error) {
                console.error("Error parsing JSON:", error, "Chunk:", chunk);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};

// UI module
const UI = {
  elements: {},
  currentInterrupt: null,

  init() {
    // Cache DOM elements
    this.elements = {
      chatBox: document.getElementById("chat-box"),
      messageInput: document.getElementById("message-input"),
      sendButton: document.getElementById("send-button"),
      nodeDialog: document.getElementById("node-dialog"),
      dialogTitle: document.getElementById("dialog-title"),
      dialogContent: document.getElementById("dialog-content"),
      closeDialog: document.getElementById("close-dialog"),
      interruptDialog: document.getElementById("interrupt-dialog"),
      interruptMessage: document.getElementById("interrupt-message"),
      continueButton: document.getElementById("continue-button"),
      stopButton: document.getElementById("stop-button"),
    };

    this.setupEventListeners();
  },

  setupEventListeners() {
    // Dialog close events
    this.elements.closeDialog.addEventListener("click", () => {
      this.elements.nodeDialog.close();
    });

    this.elements.nodeDialog.addEventListener("click", (event) => {
      if (event.target === this.elements.nodeDialog) {
        this.elements.nodeDialog.close();
      }
    });

    // Interrupt dialog events - Send actual boolean values with resume flags
    this.elements.continueButton.addEventListener("click", async () => {
      this.elements.interruptDialog.close();
      await ChatService.sendMessage(true, true, "scouting_confirmation");
    });

    this.elements.stopButton.addEventListener("click", async () => {
      this.elements.interruptDialog.close();
      await ChatService.sendMessage(false, true, "scouting_confirmation");
    });

    // Message sending events
    this.elements.sendButton.addEventListener("click", () =>
      this.handleSendMessage()
    );
    this.elements.messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") this.handleSendMessage();
    });
  },

  async handleSendMessage() {
    const message = this.elements.messageInput.value.trim();
    if (!message) return;

    this.displayUserMessage(message);
    this.elements.messageInput.value = "";
    await ChatService.sendMessage(message);
  },

  displayUserMessage(content) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "user-message");
    messageDiv.textContent = content;
    this.elements.chatBox.appendChild(messageDiv);
    this.scrollToBottom();
  },

  displayError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("message", "error-message");
    errorDiv.textContent = `Error: ${message}`;
    this.elements.chatBox.appendChild(errorDiv);
    this.scrollToBottom();
  },

  handleNodeOutput(data) {
    console.log("Node output:", data);

    const nodeName = data.node;
    const nodeOutput = data.output;

    // Handle __interrupt__ node (LangGraph v1.0 tuple format)
    if (nodeName === "__interrupt__") {
      const interruptData = nodeOutput[0].value; // Extract from tuple
      console.log("[INTERRUPT]", interruptData);
      this.currentInterrupt = interruptData;

      if (interruptData.type === "player_selection_for_scouting") {
        this.showPlayerSelectionUI(interruptData);
      } else if (interruptData.type === "scouting_confirmation") {
        this.showScoutingConfirmationUI(interruptData);
      }

      return;
    }

    // Route to appropriate renderer based on node name
    switch (nodeName) {
      case "router":
        this.displayRouterNode(nodeOutput);
        break;
      case "stats_lookup":
        this.displayStatsLookupNode(nodeOutput);
        break;
      case "usports_lookup":
        this.displayUsportsLookupNode(nodeOutput);
        break;
      case "confirm_scouting":
        this.displayConfirmScoutingNode(nodeOutput);
        break;
      case "generate_response":
        this.displayGenerateResponseNode(nodeOutput);
        break;
      // Scouting sub-graph nodes
      case "gather_data":
      case "analyze_strengths":
      case "analyze_weaknesses":
      case "trajectory_analysis":
      case "national_team_fit":
      case "comparative_stats":
      case "combine_report":
      case "generate_pdf":
        this.displayScoutingSubNode(nodeName, nodeOutput);
        break;
      default:
        this.displayGenericNode(nodeName, nodeOutput);
    }
  },

  showInterruptDialog(output) {
    // Update interrupt message if provided
    if (output && output.message) {
      const messageP = this.elements.interruptMessage.querySelector("p");
      if (messageP) {
        messageP.textContent = output.message;
      }
    }
    this.elements.interruptDialog.showModal();
  },

  displayRouterNode(output) {
    const nodeDiv = this.createNodeContainer("router", "Router");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    // Display intent, player, league, etc.
    const infoGrid = document.createElement("div");
    infoGrid.classList.add("info-grid");

    const fields = [
      { label: "Intent", value: output.intent },
      { label: "Player Name", value: output.player_name || "N/A" },
      { label: "Player ID", value: output.player_id || "N/A" },
      { label: "League", value: output.league || "N/A" },
    ];

    fields.forEach(({ label, value }) => {
      const labelDiv = document.createElement("div");
      labelDiv.classList.add("info-label");
      labelDiv.textContent = `${label}:`;

      const valueDiv = document.createElement("div");
      valueDiv.classList.add("info-value");
      valueDiv.textContent = value;

      infoGrid.appendChild(labelDiv);
      infoGrid.appendChild(valueDiv);
    });

    contentDiv.appendChild(infoGrid);

    // Add "View Details" button
    const viewButton = this.createViewDetailsButton("router", output);
    nodeDiv.querySelector(".node-header").appendChild(viewButton);

    nodeDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  displayStatsLookupNode(output) {
    const nodeDiv = this.createNodeContainer("stats_lookup", "Stats Lookup");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    // Check if query_result exists
    const queryResult = output.query_result;
    if (queryResult) {
      // Display data as table if available
      if (queryResult.data && queryResult.data.length > 0) {
        const table = this.createDataTable(queryResult.data);
        contentDiv.appendChild(table);
      }

      // Display chart_config as JSON
      if (queryResult.chart_config) {
        const chartLabel = document.createElement("div");
        chartLabel.style.marginTop = "12px";
        chartLabel.style.fontWeight = "600";
        chartLabel.style.fontSize = "13px";
        chartLabel.textContent = "Chart Configuration:";
        contentDiv.appendChild(chartLabel);

        const chartJson = document.createElement("div");
        chartJson.classList.add("json-display");
        chartJson.textContent = JSON.stringify(queryResult.chart_config, null, 2);
        contentDiv.appendChild(chartJson);
      }

      // Display summary_text
      if (queryResult.summary_text) {
        const summaryDiv = document.createElement("div");
        summaryDiv.style.marginTop = "12px";
        summaryDiv.style.fontStyle = "italic";
        summaryDiv.style.color = "#718096";
        summaryDiv.textContent = queryResult.summary_text;
        contentDiv.appendChild(summaryDiv);
      }
    }

    // Add "View Details" button
    const viewButton = this.createViewDetailsButton("stats_lookup", output);
    nodeDiv.querySelector(".node-header").appendChild(viewButton);

    nodeDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  displayUsportsLookupNode(output) {
    const nodeDiv = this.createNodeContainer("usports_lookup", "U Sports Lookup");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    const playerDetail = output.selected_player_detail;
    if (playerDetail) {
      const infoGrid = document.createElement("div");
      infoGrid.classList.add("info-grid");

      const fields = [
        { label: "Name", value: playerDetail.name },
        { label: "Position", value: playerDetail.position },
        { label: "Height", value: playerDetail.height },
        { label: "School", value: playerDetail.school },
      ];

      fields.forEach(({ label, value }) => {
        if (value) {
          const labelDiv = document.createElement("div");
          labelDiv.classList.add("info-label");
          labelDiv.textContent = `${label}:`;

          const valueDiv = document.createElement("div");
          valueDiv.classList.add("info-value");
          valueDiv.textContent = value;

          infoGrid.appendChild(labelDiv);
          infoGrid.appendChild(valueDiv);
        }
      });

      contentDiv.appendChild(infoGrid);
    }

    // Add "View Details" button
    const viewButton = this.createViewDetailsButton("usports_lookup", output);
    nodeDiv.querySelector(".node-header").appendChild(viewButton);

    nodeDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  displayConfirmScoutingNode(output) {
    const nodeDiv = this.createNodeContainer("confirm_scouting", "Confirm Scouting Report");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    if (output.type === "scouting_confirmation") {
      const messageDiv = document.createElement("div");
      messageDiv.style.fontStyle = "italic";
      messageDiv.style.color = "#d69e2e";
      messageDiv.textContent = output.message || "Waiting for user confirmation...";
      contentDiv.appendChild(messageDiv);
    }

    // Add "View Details" button
    const viewButton = this.createViewDetailsButton("confirm_scouting", output);
    nodeDiv.querySelector(".node-header").appendChild(viewButton);

    nodeDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  displayScoutingSubNode(nodeName, output) {
    // Display all scouting sub-graph nodes
    const nodeLabels = {
      gather_data: "Gather Player Data",
      analyze_strengths: "Analyze Strengths",
      analyze_weaknesses: "Analyze Weaknesses",
      trajectory_analysis: "Trajectory Analysis",
      national_team_fit: "National Team Fit",
      comparative_stats: "Comparative Stats",
      combine_report: "Combine Report",
      generate_pdf: "Generate PDF",
    };

    const label = nodeLabels[nodeName] || nodeName;
    const nodeDiv = this.createNodeContainer(nodeName, label);

    // Add "View Details" button
    const viewButton = this.createViewDetailsButton(nodeName, output);
    nodeDiv.querySelector(".node-header").appendChild(viewButton);

    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  displayGenerateResponseNode(output) {
    const nodeDiv = this.createNodeContainer("generate_response", "Response");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    const response = output.response;
    if (response && response.main_response) {
      // Add response type badge
      if (response.response_type) {
        const badge = document.createElement("div");
        badge.classList.add("response-type-badge", `badge-${response.response_type}`);
        badge.textContent = response.response_type.replace(/_/g, " ");
        contentDiv.appendChild(badge);
      }

      // Render main response as markdown
      const mainResponseDiv = renderMarkdown(response.main_response);
      contentDiv.appendChild(mainResponseDiv);

      // ===== STATS QUERY RESPONSE (response_type: query_result) =====
      if (response.response_type === "query_result") {
        // Display data table
        if (response.data && response.data.length > 0) {
          const dataLabel = document.createElement("div");
          dataLabel.classList.add("data-section-label");
          dataLabel.textContent = "Query Results";
          contentDiv.appendChild(dataLabel);

          const table = this.createDataTable(response.data);
          contentDiv.appendChild(table);
        }

        // Display chart configuration
        if (response.chart_config) {
          const chartLabel = document.createElement("div");
          chartLabel.classList.add("data-section-label");
          chartLabel.textContent = "Recommended Chart";
          contentDiv.appendChild(chartLabel);

          const chartJson = document.createElement("div");
          chartJson.classList.add("json-display");
          chartJson.textContent = JSON.stringify(response.chart_config, null, 2);
          contentDiv.appendChild(chartJson);
        }
      }

      // ===== U SPORTS LOOKUP RESPONSE (response_type: usports_player_detail) =====
      if (response.response_type === "usports_player_detail" && response.player_detail) {
        const detailLabel = document.createElement("div");
        detailLabel.classList.add("data-section-label");
        detailLabel.textContent = "Player Details";
        contentDiv.appendChild(detailLabel);

        const detailJson = document.createElement("div");
        detailJson.classList.add("json-display");
        detailJson.textContent = JSON.stringify(response.player_detail, null, 2);
        contentDiv.appendChild(detailJson);
      }

      // ===== SCOUTING REPORT RESPONSE (response_type: scouting_report_plan) =====
      if (response.response_type === "scouting_report_plan") {
        if (response.scouting_report) {
          const reportLabel = document.createElement("div");
          reportLabel.classList.add("data-section-label");
          reportLabel.textContent = "Scouting Report";
          contentDiv.appendChild(reportLabel);

          const reportJson = document.createElement("div");
          reportJson.classList.add("json-display");
          reportJson.textContent = JSON.stringify(response.scouting_report, null, 2);
          contentDiv.appendChild(reportJson);
        }

        // Display PDF download link
        // PDF URL can be either:
        // 1. GCS signed URL (https://storage.googleapis.com/...)
        // 2. Local fallback URL (/api/pdf/pdfs/scouting-reports/...)
        // Browser handles both automatically
        if (response.pdf_url) {
          const pdfLink = document.createElement("a");
          pdfLink.href = response.pdf_url;
          pdfLink.target = "_blank";
          pdfLink.classList.add("pdf-download-button");
          pdfLink.textContent = "📄 View Scouting Report PDF";
          contentDiv.appendChild(pdfLink);
        }
      }
    }

    nodeDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  displayGenericNode(nodeName, output) {
    const nodeDiv = this.createNodeContainer(nodeName, nodeName);

    // Add "View Details" button
    const viewButton = this.createViewDetailsButton(nodeName, output);
    nodeDiv.querySelector(".node-header").appendChild(viewButton);

    this.elements.chatBox.appendChild(nodeDiv);
    this.scrollToBottom();
  },

  createNodeContainer(className, headerText) {
    const nodeDiv = document.createElement("div");
    nodeDiv.classList.add("node-output", `node-${className}`);

    const nodeHeader = document.createElement("div");
    nodeHeader.classList.add("node-header");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = headerText;
    nodeHeader.appendChild(nameSpan);

    nodeDiv.appendChild(nodeHeader);
    return nodeDiv;
  },

  createViewDetailsButton(nodeName, nodeOutput) {
    const viewButton = document.createElement("button");
    viewButton.classList.add("node-toggle");
    viewButton.textContent = "View Details";
    viewButton.addEventListener("click", () => {
      this.showNodeDialog(nodeName, nodeOutput);
    });
    return viewButton;
  },

  createDataTable(data) {
    if (!data || data.length === 0) return document.createElement("div");

    const table = document.createElement("table");
    table.classList.add("data-table");

    // Create header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const keys = Object.keys(data[0]);
    keys.forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement("tbody");
    data.forEach((row) => {
      const tr = document.createElement("tr");
      keys.forEach((key) => {
        const td = document.createElement("td");
        td.textContent = row[key] !== null && row[key] !== undefined ? row[key] : "—";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  },

  showNodeDialog(nodeName, nodeOutput) {
    this.elements.dialogTitle.textContent = `Node: ${nodeName}`;
    this.elements.dialogContent.innerHTML = "";

    // Display node output as formatted JSON
    const pre = document.createElement("pre");
    pre.classList.add("json-display");
    pre.textContent = JSON.stringify(nodeOutput, null, 2);
    this.elements.dialogContent.appendChild(pre);

    this.elements.nodeDialog.showModal();
  },

  showPlayerSelectionUI(interruptData) {
    const { search_results, message } = interruptData;

    const messageDiv = this.createNodeContainer("interrupt", "Player Selection");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    const instructionP = document.createElement("p");
    instructionP.textContent = message || "Select a player:";
    instructionP.style.marginBottom = "12px";
    instructionP.style.fontWeight = "600";
    contentDiv.appendChild(instructionP);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("player-selection-buttons");

    search_results.forEach((player, index) => {
      const button = document.createElement("button");
      button.classList.add("player-select-btn");
      button.textContent = `${player.full_name} - ${player.league}`;
      button.addEventListener("click", async () => {
        buttonContainer.querySelectorAll("button").forEach((b) => (b.disabled = true));
        await ChatService.sendMessage(index, true, "player_selection_for_scouting");
      });
      buttonContainer.appendChild(button);
    });

    contentDiv.appendChild(buttonContainer);
    messageDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(messageDiv);
    this.scrollToBottom();
  },

  showScoutingConfirmationUI(interruptData) {
    const { player_name, league, message } = interruptData;

    const messageDiv = this.createNodeContainer("interrupt", "Scouting Confirmation");
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("node-content");

    const messageP = document.createElement("p");
    messageP.textContent = message || `Generate scouting report for ${player_name} (${league})?`;
    messageP.style.marginBottom = "12px";
    messageP.style.fontStyle = "italic";
    contentDiv.appendChild(messageP);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("confirmation-buttons");

    const approveBtn = document.createElement("button");
    approveBtn.classList.add("continue-button");
    approveBtn.textContent = "Generate Report";
    approveBtn.addEventListener("click", async () => {
      buttonContainer.remove();
      await ChatService.sendMessage(true, true, "scouting_confirmation");
      this.elements.interruptDialog.close();
    });

    const rejectBtn = document.createElement("button");
    rejectBtn.classList.add("stop-button");
    rejectBtn.textContent = "Cancel";
    rejectBtn.addEventListener("click", async () => {
      buttonContainer.remove();
      await ChatService.sendMessage(false, true, "scouting_confirmation");
      this.elements.interruptDialog.close();
    });

    buttonContainer.appendChild(approveBtn);
    buttonContainer.appendChild(rejectBtn);
    contentDiv.appendChild(buttonContainer);

    messageDiv.appendChild(contentDiv);
    this.elements.chatBox.appendChild(messageDiv);
    this.scrollToBottom();

    // Also show modal
    this.showInterruptDialog(interruptData);
  },

    scrollToBottom() {
    this.elements.chatBox.scrollTop = this.elements.chatBox.scrollHeight;
  },
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  UI.init();
});
