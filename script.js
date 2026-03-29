const csvUrl =
  //  "https://pub-fcae7e9489944989985f39a9c09563c5.r2.dev/laskennassa.csv";
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQb1OGoT6WIHnhIfz4CmtRW4U5vKWChnZRWJmtUWhEaIAOz8okH-lg_wT3JJ9L2Sxqj6jMmi8l9SDgv/pub?gid=0&single=true&output=csv";
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCSV(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  return lines.map(parseCSVLine);
}

function buildTable(rows, fetchMs, totalMs) {
  const table = document.getElementById("csv-table");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const status = document.getElementById("table-status");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (rows.length === 0) {
    status.textContent = `No data found. Fetch: ${fetchMs} ms. Total: ${totalMs} ms.`;
    return;
  }

  const headers = rows[0].slice(0, 6);
  const dataRows = rows.slice(1);

  const headerRow = document.createElement("tr");
  headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  dataRows.forEach((row) => {
    const tr = document.createElement("tr");

    for (let i = 0; i < 6; i++) {
      const td = document.createElement("td");
      td.textContent = row[i] ? row[i] : "";
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  status.textContent = `${dataRows.length} row(s) loaded. Fetch: ${fetchMs} ms. Total: ${totalMs} ms.`;
}

const totalStart = performance.now();
const fetchStart = performance.now();

fetch(csvUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Could not load CSV.");
    }
    return response.text();
  })
  .then((csvText) => {
    const fetchMs = Math.round(performance.now() - fetchStart);
    const rows = parseCSV(csvText);
    const totalMs = Math.round(performance.now() - totalStart);
    buildTable(rows, fetchMs, totalMs);
  })
  .catch((error) => {
    const totalMs = Math.round(performance.now() - totalStart);
    document.getElementById("table-status").textContent =
      `Error loading table data after ${totalMs} ms.`;
    console.error(error);
  });
