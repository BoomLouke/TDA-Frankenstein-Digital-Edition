// Declare variables for getting the xml file for the XSL transformation (folio_xml) and to load the image in IIIF on the page in question (number).
let tei = document.getElementById("folio");
let tei_xml = tei.innerHTML;
let extension = ".xml";
let folio_xml = tei_xml.concat(extension);
let page = document.getElementById("page");
let pageN = page.innerHTML;
let number = Number(pageN);

// Loading the IIIF manifest
var mirador = Mirador.viewer({
  "id": "my-mirador",
  "manifests": {
    "https://iiif.bodleian.ox.ac.uk/iiif/manifest/53fd0f29-d482-46e1-aa9d-37829b49987d.json": {
      provider: "Bodleian Library, University of Oxford"
    }
  },
  "window": {
    allowClose: false,
    allowWindowSideBar: true,
    allowTopMenuButton: false,
    allowMaximize: false,
    hideWindowTitle: true,
    panels: {
      info: false,
      attribution: false,
      canvas: true,
      annotations: false,
      search: false,
      layers: false,
    }
  },
  "workspaceControlPanel": {
    enabled: false,
  },
  "windows": [
    {
      loadedManifest: "https://iiif.bodleian.ox.ac.uk/iiif/manifest/53fd0f29-d482-46e1-aa9d-37829b49987d.json",
      canvasIndex: number,
      thumbnailNavigationPosition: 'off'
    }
  ]
});


// function to transform the text encoded in TEI with the xsl stylesheet "Frankenstein_text.xsl", this will apply the templates and output the text in the html <div id="text">
function documentLoader() {

    Promise.all([
      fetch(folio_xml).then(response => response.text()),
      fetch("Frankenstein_text.xsl").then(response => response.text())
    ])
    .then(function ([xmlString, xslString]) {
      var parser = new DOMParser();
      var xml_doc = parser.parseFromString(xmlString, "text/xml");
      var xsl_doc = parser.parseFromString(xslString, "text/xml");

      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsl_doc);
      var resultDocument = xsltProcessor.transformToFragment(xml_doc, document);

      var criticalElement = document.getElementById("text");
      criticalElement.innerHTML = ''; // Clear existing content
      criticalElement.appendChild(resultDocument);
    })
    .catch(function (error) {
      console.error("Error loading documents:", error);
    });
  }
  
// function to transform the metadate encoded in teiHeader with the xsl stylesheet "Frankenstein_meta.xsl", this will apply the templates and output the text in the html <div id="stats">
  function statsLoader() {

    Promise.all([
      fetch(folio_xml).then(response => response.text()),
      fetch("Frankenstein_meta.xsl").then(response => response.text())
    ])
    .then(function ([xmlString, xslString]) {
      var parser = new DOMParser();
      var xml_doc = parser.parseFromString(xmlString, "text/xml");
      var xsl_doc = parser.parseFromString(xslString, "text/xml");

      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsl_doc);
      var resultDocument = xsltProcessor.transformToFragment(xml_doc, document);

      var criticalElement = document.getElementById("stats");
      criticalElement.innerHTML = ''; // Clear existing content
      criticalElement.appendChild(resultDocument);
    })
    .catch(function (error) {
      console.error("Error loading documents:", error);
    });
  }

  // Initial document load
  documentLoader();
  statsLoader();
  // Event listener for sel1 change
  function selectHand(event) {
  var visible_mary = document.getElementsByClassName('#MWS');
  var visible_percy = document.getElementsByClassName('#PBS');
  // Convert the HTMLCollection to an array for forEach compatibility
  var MaryArray = Array.from(visible_mary);
  var PercyArray = Array.from(visible_percy);
  if (event.target.value == 'both') {
    MaryArray.forEach(function(element) {
      element.style.backgroundColor = 'transparent';
      element.style.color = 'black';
    });
    PercyArray.forEach(function(element) {
      element.style.backgroundColor = 'transparent';
      element.style.color = 'black';
    });
  } else if (event.target.value == 'Mary') {
    MaryArray.forEach(function(element) {
    
      element.style.color = '#f1b53d'; 
    });
    PercyArray.forEach(function(element) {
      element.style.backgroundColor = 'transparent';
      element.style.color = 'black';
    });
  } else {
    PercyArray.forEach(function(element) {
      element.style.backgroundColor = '#ffda91';
    });
    MaryArray.forEach(function(element) {
      element.style.backgroundColor = 'transparent';
      element.style.color = 'black';
    });
  }
}
// write another function that will toggle the display of the deletions by clicking on a button
function toggleDeletions() {
  var deletions = document.getElementsByTagName('del');
  var deletionsArray = Array.from(deletions);
  

  var button = document.getElementById('toggle-deletions');
  
  var isVisible = deletionsArray.length > 0 ? 
    (deletionsArray[0].style.display !== 'none') : true;
  
  deletionsArray.forEach(function(element) {
    element.style.display = isVisible ? 'none' : 'inline';
  });
  
  button.textContent = isVisible ? 'Show Deletions' : 'Hide Deletions';
}

document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('toggle-deletions');
  if (button) {
    button.addEventListener('click', toggleDeletions);
  }
});
//function that allows to switch from folio to folio:
function getNextPage() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();

  const pageNum = parseInt(currentPage.substring(0, 2));
  const side = currentPage.charAt(2);
  
  let nextPage;
  if (side === 'r') {

      nextPage = `${pageNum}v.html`;
  } else {
      nextPage = `${pageNum + 1}r.html`;
  }
  
  if (currentPage === '25v.html') {
      return null;
  }
  
  return nextPage;
}

function getPreviousPage() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop();
  
  const pageNum = parseInt(currentPage.substring(0, 2));
  const side = currentPage.charAt(2);
  
  let prevPage;
  if (side === 'v') {
      prevPage = `${pageNum}r.html`;
  } else {
      prevPage = `${pageNum - 1}v.html`;
  }
  
  if (currentPage === '21r.html') {
      return null;
  }
  
  return prevPage;
}

function updateNavigationButtons() {
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  
  const prevPage = getPreviousPage();
  const nextPage = getNextPage();
  
  if (prevPage) {
      prevButton.style.display = 'inline-block';
      prevButton.onclick = () => window.location.href = prevPage;
  } else {
      prevButton.style.display = 'none';
  }
  
  if (nextPage) {
      nextButton.style.display = 'inline-block';
      nextButton.onclick = () => window.location.href = nextPage;
  } else {
      nextButton.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation buttons
  updateNavigationButtons();
  
  // Add event listeners for hover states
  const buttons = document.querySelectorAll('.navigation-buttons button');
  buttons.forEach(button => {
      button.addEventListener('mouseover', function() {
          if (!this.disabled) {
              this.style.backgroundColor = '#d99f2b';
          }
      });
      
      button.addEventListener('mouseout', function() {
          if (!this.disabled) {
              this.style.backgroundColor = 'var(--accent-color)';
          }
      });
  });
});