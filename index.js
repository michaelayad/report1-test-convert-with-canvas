window.jsPDF = window.jspdf.jsPDF;

document.getElementById("downloadBtn").addEventListener("click", async () => {
  // Save the original viewport content
  var originalViewport = document.querySelector("meta[name=viewport]").content;
  // Change the viewport to a fixed width
  document
    .querySelector("meta[name=viewport]")
    .setAttribute("content", "width=1400");

  document.getElementById("spinner").style.display = "flex";

  var doc = new jsPDF("p", "mm", "a4", true);
  // Define PDF dimensions
  var pdfWidth = 210;
  var pdfHeight = 297;
  var pdfMargin = 10; // Margin for borders or outlines
  var startY = pdfMargin;
  var windowWidth = 1400;
  var elementScaleFactor = pdfWidth / windowWidth;
  var remainingSpace = pdfHeight - 2 * startY;
  var page = 1;

  async function captureCanvasAfterWidthModification() {
    // Process different groups of elements
    await processElements(
      document.querySelectorAll(
        ".pdf-header, .session-Statistic, .assistant-table-header, .assistant-table-rows"
      )
    );

    // Save the PDF
    // Get the base64 encoded PDF as a string
    var pdfBase64 = doc.output("datauristring");
    console.log("eee");
    // Create a link element
    var downloadLink = document.createElement("a");
    downloadLink.href = pdfBase64;
    downloadLink.download = encodeURIComponent("session-report.pdf");
    // Set the filename
    downloadLink.click();
    document.getElementById("spinner").style.display = "none";
    document
      .querySelector("meta[name=viewport]")
      .setAttribute("content", originalViewport);
  }

  async function processElements(elements) {
    var parentElement = document.createElement("div");
    var footer = document.getElementById("pdf-footer");
    var footerCanvas = await html2canvas(footer, {
      windowWidth: windowWidth,
      scale: 1,
    });
    var footerHeight = footer.offsetHeight * elementScaleFactor;
    remainingSpace -= footerHeight;
    var parentHeight = 0;
    parentElement.style.width = 1400;
    for (let i = 0; i < elements.length; i++) {
      var element = elements[i];
      var elementHeight = element.offsetHeight * elementScaleFactor;
      // console.log(i);
      var elementClone = element.cloneNode(true);
      if (remainingSpace > elementHeight) {
        remainingSpace -= elementHeight;
        parentElement.appendChild(elementClone);
        parentHeight += elementHeight;
      } else {
        remainingSpace = pdfHeight - 2 * startY;
        document.body.appendChild(parentElement);
        var canvas = await html2canvas(parentElement, {
          windowWidth: windowWidth,
          scale: 1,
        });
        // console.log("kkkk");
        await doc.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          pdfMargin,
          startY,
          190,
          parentHeight,
          "",
          "FAST"
        );
        await doc.addImage(
          footerCanvas.toDataURL("image/png"),
          "PNG",
          pdfMargin,
          pdfHeight - pdfMargin - footerHeight,
          190,
          footerHeight,
          "",
          "FAST"
        );
        document.body.removeChild(parentElement);
        parentElement.innerHTML = "";
        parentElement.appendChild(elementClone);
        parentHeight = 0;
        page++;
        doc.addPage();
      }
    }
    document.body.appendChild(parentElement);
    var canvas = await html2canvas(parentElement, {
      windowWidth: windowWidth,
      scale: 1,
    });
    // console.log("kkkk", page, parentHeight, canvas);
    await doc.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      pdfMargin,
      startY,
      190,
      parentHeight,
      "",
      "FAST"
    );
    await doc.addImage(
      footerCanvas.toDataURL("image/png"),
      "PNG",
      pdfMargin,
      pdfHeight - pdfMargin - footerHeight,
      190,
      footerHeight,
      "",
      "FAST"
    );
    document.body.removeChild(parentElement);
  }

  await captureCanvasAfterWidthModification();
});
