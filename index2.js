window.jsPDF = window.jspdf.jsPDF;

var doc = new jsPDF("p", "mm", "a4");
document.getElementById("downloadBtn").addEventListener("click", async () => {
  // Save the original viewport content
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
  async function processElements(elements) {
    var parentElement = document.createElement("div");
    var footer = document.getElementById("pdf-footer");
    var footerCanvas = await html2canvas(footer, {
      windowWidth: windowWidth,
    });
    var footerHeight = footer.offsetHeight * elementScaleFactor;
    remainingSpace -= footerHeight;
    var parentHeight = 0;
    parentElement.style.width = 1400;
    for (let i = 0; i < elements.length; i++) {
      var element = elements[i];
      var elementHeight = element.offsetHeight * elementScaleFactor;
      console.log(i);
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
        });
        console.log("kkkk");
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
    });
    console.log("kkkk", page, parentHeight, canvas);
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
