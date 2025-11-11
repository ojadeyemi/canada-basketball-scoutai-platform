import json
from datetime import datetime
from pathlib import Path
from typing import Any

from playwright.async_api import Browser, Page, async_playwright


class PDFGenerator:
    """PDFGenerator is a class for generating PDFs from HTML templates using Playwright.
    It handles the setup of template directories, ensures the output directory exists,
    and provides methods to generate PDFs with the current date and custom options.
    Attributes:
        template_dir (Path): Directory where HTML templates are stored.
        pdf_output_dir (Path): Directory where generated PDFs will be saved.
        Raises:
            ValueError: If the template directory does not exist.

            FileNotFoundError: If the template file is not found in the template directory.

            SecurityError: If the template path is outside the allowed directory.
    """

    def __init__(self):
        current_file = Path(__file__).resolve()
        self.template_dir = current_file.parent / "pdf_assets"

        if not self.template_dir.exists():
            raise ValueError(f"Template directory does not exist: {self.template_dir}")

        self.pdf_output_dir = current_file.parent / "pdf"
        self.pdf_output_dir.mkdir(parents=True, exist_ok=True)

    def _add_current_date(self, data: dict[str, Any]) -> dict[str, Any]:
        """Add current date information to the gameplan data."""
        now = datetime.now()
        data_with_date = data.copy()
        data_with_date.update(
            {
                "current_date": {
                    "month_day": now.strftime("%B %d"),
                    "year": now.strftime("%Y"),
                }
            }
        )
        return data_with_date

    def _ensure_pdf_extension(self, filename: str) -> str:
        safe_filename = "".join(c for c in filename if c.isalnum() or c in (" ", "-", "_")).strip()
        if not safe_filename:
            safe_filename = "output"

        if not safe_filename.lower().endswith(".pdf"):
            safe_filename = f"{safe_filename}.pdf"

        if not safe_filename.startswith("pdf/"):
            safe_filename = f"pdf/{safe_filename}"

        return safe_filename

    def _validate_template_path(self) -> Path:
        template_path = self.template_dir / "template.html"

        if not template_path.exists():
            raise FileNotFoundError(f"template.html not found in {self.template_dir}")

        try:
            template_path.resolve().relative_to(self.template_dir.resolve())
        except ValueError:
            raise SecurityError("Template path outside allowed directory")

        return template_path

    async def generate_pdf(self, data: dict[str, Any], pdf_title: str, width: str = "816px", **pdf_options) -> Path:
        if not isinstance(data, dict):
            raise ValueError("Data must be a dictionary")

        # Add current date to data (only if not already present - for scouting reports)
        if "current_date" not in data:
            data = self._add_current_date(data)

        output_pdf = self._ensure_pdf_extension(pdf_title)
        html_path = self._validate_template_path()

        async with async_playwright() as p:
            browser: Browser = await p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
            page: Page = await browser.new_page()

            await page.set_extra_http_headers(
                {"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline';"}
            )

            await page.goto(f"file://{html_path}", wait_until="load")

            await page.add_script_tag(
                content=f"""
                window.jsonData = {json.dumps(data, ensure_ascii=True)};
                if (typeof loadContent === 'function') {{
                    loadContent();
                }}
                """
            )

            # Wait for the main content to be ready
            await page.wait_for_selector("#steps-container", timeout=10000)

            # Wait for final recommendation section to be populated
            await page.wait_for_selector("#final-recommendation-section", timeout=10000)

            # Wait for charts to fully render
            await page.wait_for_timeout(1000)

            await page.set_viewport_size({"width": 816, "height": 2600})
            await page.emulate_media(media="screen")

            content_height = await page.evaluate("document.documentElement.scrollHeight")

            output_path = Path(output_pdf).resolve()
            output_path.parent.mkdir(parents=True, exist_ok=True)

            await page.pdf(
                path=str(output_path),
                width=width,
                height=f"{content_height}px",
                print_background=True,
                prefer_css_page_size=False,
                scale=1.0,
                **pdf_options,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            )

            await browser.close()
            print(f"PDF generated: {output_path}")
            return output_path


class SecurityError(Exception):
    pass
