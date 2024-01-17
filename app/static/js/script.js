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
