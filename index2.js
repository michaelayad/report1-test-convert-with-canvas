window.jsPDF = window.jspdf.jsPDF;

document.getElementById("downloadBtn").addEventListener("click", async () => {
  // Save the original viewport content
  var doc = new jsPDF("p", "mm", "a4");

  var originalViewport = document.querySelector("meta[name=viewport]").content;
  document.getElementById("spinner").style.display = "flex";

  // Change the viewport to a fixed width
  document
    .querySelector("meta[name=viewport]")
    .setAttribute("content", "width=1400");

  // Define PDF dimensions
  var pdfWidth = 210;
  var pdfHeight = 297;
  var pdfMargin = 10; // Margin for borders or outlines
  var startY = pdfMargin;
  var windowWidth = 1400;
  var elementScaleFactor = pdfWidth / windowWidth;
  var remainingSpace = pdfHeight - 2 * startY;
  var page = 1;
  var footer = document.getElementById("pdf-footer");
  var footerCanvas = await html2canvas(footer, {
    windowWidth: windowWidth,
  });
  var footerHeight = footer.offsetHeight * elementScaleFactor;
  async function processElements(elements) {
    var parentElement = document.createElement("div");

    remainingSpace -= footerHeight;
    var parentHeight = 0;
    parentElement.style.width = 1400;
    for (let i = 0; i < elements.length; i++) {
      var element = elements[i];
      var elementHeight = element.offsetHeight * elementScaleFactor;
      var elementClone = element.cloneNode(true);
      if (remainingSpace > elementHeight) {
        remainingSpace -= elementHeight;
        parentElement.appendChild(elementClone);
        parentHeight += elementHeight;
      } else {
        await addParentElementToPDF(parentElement, parentHeight, footerCanvas);

        // Reset variables for the new page
        remainingSpace = pdfHeight - 2 * startY;
        parentElement.innerHTML = "";
        parentElement.appendChild(elementClone);
        parentHeight = 0;
        page++;
        doc.addPage();
      }
    }
    await addParentElementToPDF(parentElement, parentHeight, footerCanvas);
    console.log(parentElement);
  }

  async function addParentElementToPDF(
    parentElement,
    parentHeight,
    footerCanvas
  ) {
    document.body.appendChild(parentElement);
    console.log(document.body);
    var canvas = await html2canvas(parentElement, {
      windowWidth: windowWidth,
    });

    await doc.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      pdfMargin,
      startY,
      190,
      parentHeight
    );

    await doc.addImage(
      footerCanvas.toDataURL("image/png"),
      "PNG",
      pdfMargin,
      pdfHeight - pdfMargin - footerHeight,
      190,
      footerHeight
    );

    document.body.removeChild(parentElement);
    console.log(document.body);
  }
  // Process different groups of elements
  await processElements(
    document.querySelectorAll(
      ".pdf-header , .registered-table , .unregistered-header , .unregistered-table"
    )
  );

  // Save the PDF
  doc.save("تقرير الحصة الداخلى.pdf");
  document.getElementById("spinner").style.display = "none";
  document
    .querySelector("meta[name=viewport]")
    .setAttribute("content", originalViewport);
});
