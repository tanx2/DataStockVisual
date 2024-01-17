console.log('sdfsdfdffsf')


function deleteRow(button) {
  console.log("delete function");
  var row = button.parentNode.parentNode;
  var id = row.getAttribute("data-id");

  // Make AJAX request to delete the model
  deleteModel(id);
}

function deleteModel(id) {
  var csrfToken = $("input[name=csrfmiddlewaretoken]").val();
  console.log("delete model", id);
  $.ajax({
    type: "POST",
    url: "/delete_model/", // Replace with the actual URL for deleting the model
    data: {
      csrfmiddlewaretoken: csrfToken,
      id: id,
    },
    headers: {
      "X-CSRFToken": csrfToken,
    },
    success: function (response) {
      updateStatus("Model deleted successfully", "success");

      // Remove the row from the table upon successful deletion
      $("tr[data-id=" + id + "]").remove();
    },
    error: function (error) {
      updateStatus("Model was not deleted.", "error");
      console.error("Error deleting model:", error);
    },
  });
}

function editRow(button) {
  console.log("ldsfsf");
  var row = button.parentNode.parentNode;
  var cells = row.getElementsByTagName("td");
  var id = row.getAttribute("data-id");

  for (var i = 0; i < cells.length - 2; i++) {
    // Exclude the last cell with the "Edit" button
    var cell = cells[i];
    var cellValue = cell.innerText;

    // Replace td content with input field
    
    cell.innerHTML = '<input type="text" style="max-width: 80px; padding: 5px;" value="' + cellValue + '">';

  }
  // Replace "Edit" button with "Save" button
  var buttonId = "#button" + id;
  var editButton = row.querySelector(buttonId);
  console.log("button name", "button" + id);
  console.log(editButton);
  editButton.innerText = "Save";
  editButton.classList.remove("button-x");
  editButton.classList.add("button-3");
  editButton.onclick = function () {
    saveRow(this, buttonId);
  };
}

function saveRow(button, buttonId) {
  var row = button.parentNode.parentNode;
  var cells = row.getElementsByTagName("td");
  console.log("🚀 ~ saveRow ~ cells:", cells)
  var dataToUpdate = {};
  var id = button.getAttribute("data-id");
  var columnName = [
    "id",
    "trade_code",
    "date",
    "open",
    "high",
    "low",
    "close",
    "volume",
  ];

  for (var i = 0; i < cells.length - 2; i++) {
    // Exclude the last cell with the "Save" button
    
    var cell = cells[i];
    console.log("cell", cell);
    var input = cell.querySelector("input");
    var inputValue = input.value;

    // Replace input field with updated td content
    cell.innerText = inputValue;

    dataToUpdate[columnName[i]] = inputValue;
    

  }
  console.log("🚀 ~ saveRow ~ dataToUpdate:", dataToUpdate)

  var saveButton = row.querySelector(buttonId);
  saveButton.innerText = "Edit";
  saveButton.classList.remove("button-3");
  saveButton.classList.add("button-x");
  saveButton.onclick = function () {
    editRow(this);
  };
  // Make AJAX request to update the model
  updateModel(dataToUpdate);
}

function updateStatus(Message, type){
  var requestStatus = document.querySelector("#crud-status");
  if(type == "success")
    requestStatus.innerHTML = '<img id="status-img" src="static/images/green-tick.png" alt=""><span style="color:green">'+Message+'</span>';
  else
    requestStatus.innerHTML = '<img id="status-img" src="static/images/red-cross.png" alt=""><span style="color:red">' + Message + "</span>";
  // Show the message for 3 seconds (adjust the time as needed)
  setTimeout(function () {
    requestStatus.innerText = "";
  }, 5000); // 3000 milliseconds = 3 seconds
  alert(Message);
}

function updateModel(dataToUpdate) {
  console.log("🚀 ~ updateModel ~ dataToUpdate:", dataToUpdate)

  // Get the CSRF token from the HTML form
  var csrfToken = $("input[name=csrfmiddlewaretoken]").val();
  console.log("csrfToken", csrfToken);

  $.ajax({
    type: "POST",
    url: "/update_model/", // Replace with the actual URL for updating the model
    data: {
      csrfmiddlewaretoken: csrfToken,
      data: JSON.stringify(dataToUpdate),
    },
    headers: {
      "X-CSRFToken": csrfToken, // Include the CSRF token in the headers
    },
    success: function (response) {
      console.log("Model updated successfully:", response);
      updateStatus('Model updated successfully', 'success');
      
    },
    error: function (error) {
      console.error("Error updating model:", error);
      updateStatus("Model was not updated! Check the inputs.", "error");
    },
  });
}

const search = document.querySelector(".input-group input"),
  table_rows = document.querySelectorAll("tbody tr"),
  table_headings = document.querySelectorAll("thead th");

// 1. Searching for specific data of HTML table
search.addEventListener("input", searchTable);

function searchTable() {
  table_rows.forEach((row, i) => {
    let table_data = row.textContent.toLowerCase(),
      search_data = search.value.toLowerCase();

    row.classList.toggle("hide", table_data.indexOf(search_data) < 0);
    row.style.setProperty("--delay", i / 25 + "s");
  });

  document.querySelectorAll("tbody tr:not(.hide)").forEach((visible_row, i) => {
    visible_row.style.backgroundColor =
      i % 2 == 0 ? "transparent" : "#0000000b";
  });
}

// 2. Sorting | Ordering data of HTML table
table_headings.forEach((head, i) => {
  let sort_asc = true;
  head.onclick = () => {
    table_headings.forEach((head) => head.classList.remove("active"));
    head.classList.add("active");

    document
      .querySelectorAll("td")
      .forEach((td) => td.classList.remove("active"));
    table_rows.forEach((row) => {
      row.querySelectorAll("td")[i].classList.add("active");
    });

    head.classList.toggle("asc", sort_asc);
    sort_asc = head.classList.contains("asc") ? false : true;

    sortTable(i, sort_asc);
  };
});

function sortTable(column, sort_asc) {
  [...table_rows]
    .sort((a, b) => {
      let first_row = a
          .querySelectorAll("td")
          [column].textContent.toLowerCase(),
        second_row = b.querySelectorAll("td")[column].textContent.toLowerCase();

      return sort_asc
        ? first_row < second_row
          ? 1
          : -1
        : first_row < second_row
        ? -1
        : 1;
    })
    .map((sorted_row) =>
      document.querySelector("tbody").appendChild(sorted_row)
    );
}

// 3. Converting HTML table to PDF
const pdf_btn = document.querySelector("#toPDF");
const customers_table = document.querySelector("#customers_table");

const toPDF = function (customers_table) {
  const html_code = `
    <!DOCTYPE html>
    <link rel="stylesheet" type="text/css" href="style.css">
    <main class="table" id="customers_table">${customers_table.innerHTML}</main>`;

  const new_window = window.open();
  new_window.document.write(html_code);

  setTimeout(() => {
    new_window.print();
    new_window.close();
  }, 400);
};

pdf_btn.onclick = () => {
  toPDF(customers_table);
};

// 4. Converting HTML table to JSON
const json_btn = document.querySelector("#toJSON");

const toJSON = function (table) {
  let table_data = [],
    t_head = [],
    t_headings = table.querySelectorAll("th"),
    t_rows = table.querySelectorAll("tbody tr");

  for (let t_heading of t_headings) {
    let actual_head = t_heading.textContent.trim().split(" ");

    t_head.push(
      actual_head
        .splice(0, actual_head.length - 1)
        .join(" ")
        .toLowerCase()
    );
  }

  t_rows.forEach((row) => {
    const row_object = {},
      t_cells = row.querySelectorAll("td");

    t_cells.forEach((t_cell, cell_index) => {
      const img = t_cell.querySelector("img");
      if (img) {
        row_object["customer image"] = decodeURIComponent(img.src);
      }
      row_object[t_head[cell_index]] = t_cell.textContent.trim();
    });
    table_data.push(row_object);
  });

  return JSON.stringify(table_data, null, 4);
};

json_btn.onclick = () => {
  const json = toJSON(customers_table);
  downloadFile(json, "json");
};

// 5. Converting HTML table to CSV File
const csv_btn = document.querySelector("#toCSV");

const toCSV = function (table) {
  // Code For SIMPLE TABLE
  // const t_rows = table.querySelectorAll('tr');
  // return [...t_rows].map(row => {
  //     const cells = row.querySelectorAll('th, td');
  //     return [...cells].map(cell => cell.textContent.trim()).join(',');
  // }).join('\n');

  const t_heads = table.querySelectorAll("th"),
    tbody_rows = table.querySelectorAll("tbody tr");

  const headings =
    [...t_heads]
      .map((head) => {
        let actual_head = head.textContent.trim().split(" ");
        return actual_head
          .splice(0, actual_head.length - 1)
          .join(" ")
          .toLowerCase();
      })
      .join(",") +
    "," +
    "image name";

  const table_data = [...tbody_rows]
    .map((row) => {
      const cells = row.querySelectorAll("td"),
        img = decodeURIComponent(row.querySelector("img").src),
        data_without_img = [...cells]
          .map((cell) => cell.textContent.replace(/,/g, ".").trim())
          .join(",");

      return data_without_img + "," + img;
    })
    .join("\n");

  return headings + "\n" + table_data;
};

csv_btn.onclick = () => {
  const csv = toCSV(customers_table);
  downloadFile(csv, "csv", "customer orders");
};

// 6. Converting HTML table to EXCEL File
const excel_btn = document.querySelector("#toEXCEL");

const toExcel = function (table) {
  const t_heads = table.querySelectorAll("th"),
    tbody_rows = table.querySelectorAll("tbody tr");

  const headings =
    [...t_heads]
      .map((head) => {
        let actual_head = head.textContent.trim().split(" ");
        return actual_head
          .splice(0, actual_head.length - 1)
          .join(" ")
          .toLowerCase();
      })
      .join("\t") +
    "\t" +
    "image name";

  const table_data = [...tbody_rows]
    .map((row) => {
      const cells = row.querySelectorAll("td"),
        img = decodeURIComponent(row.querySelector("img").src),
        data_without_img = [...cells]
          .map((cell) => cell.textContent.trim())
          .join("\t");

      return data_without_img + "\t" + img;
    })
    .join("\n");

  return headings + "\n" + table_data;
};

excel_btn.onclick = () => {
  const excel = toExcel(customers_table);
  downloadFile(excel, "excel");
};

const downloadFile = function (data, fileType, fileName = "") {
  const a = document.createElement("a");
  a.download = fileName;
  const mime_types = {
    json: "application/json",
    csv: "text/csv",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  a.href = `
        data:${mime_types[fileType]};charset=utf-8,${encodeURIComponent(data)}
    `;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
