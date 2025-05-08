let url = "http://localhost:7001/printers";
let filteredData = {};

async function getPrinters() {
  const response = await fetch(url);
  const { printers } = await response.json();

  filteredData = Object.fromEntries(
    Object.entries(printers).filter(([key, value]) => Array.isArray(value))
  );

  for (const key in filteredData) {
    const div = $("<div>", {
      text: "",
      id: key,
    });

    addHeader(key, div);
    filteredData[key].forEach((counter, index) => {
      renderElements(
        counter.id,
        counter.ip,
        counter.k_id,
        counter.print,
        key + "-" + counter.id,
        div,
        counter.cash_drawer_path
      );
    });

    $("#taskForm").append(div);
  }
  $(".loader").hide();
}

function addHeader(title, element) {
  element.append(`            
        <div class="elements-header">
          <div class='header-inner'>
            <h1 class="title">${title}</h1>

            <span onclick="addIp(${title})" class="add-icon"> <svg stroke="white" fill="white" stroke-width="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path></svg> </span>
          </div>
        </div>
    `);
}

async function handlePing(event, ip, key) {
  console.log("-------ip, key--------", ip, key);
  $(".loader").show();

  event.preventDefault();
  try {
    const splitData = key.split("-");
    const printerIp = filteredData[splitData[0]].find(
      (printer) => printer.id == splitData[1]
    );

    const response = await fetch("http://localhost:7001/ping-ip", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pingIp: printerIp?.ip }), // Convert the data object to a JSON string
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result);

      document.getElementById(
        "alive-ip"
      ).textContent = `Alive Ip: ${result?.data?.alive}`;
      document.getElementById(
        "output-ip"
      ).textContent = `${result?.data?.output}`;
      modalEvent(false);
    } else {
      console.error("Ping failed");
    }
  } catch (error) {
    console.error("Error:", error);
  }
  $(".loader").hide();
}

async function updatePrinters() {
  $(".loader").show();
  let errors = [];

  $(".form-group").each(function (index) {
    var id = $(this).attr("id");
    var ipValue = $(this).find(`#ip-${id}`).val();
    var kIdValue = $(this).find("#k_id").val();
    var printValue = $(this).find("#print").prop("checked");
    var cash_drawer_port = $(this).find("#cash_drawer_port").val();


    const splitData = id.split("-");
    let printer = filteredData[splitData[0]].find((p) => p.id == splitData[1]);

    if (isValidIP(ipValue) == false) {
      $(this).find("#ip").css("border", "1px solid red");
      $(this).find(".ip-error").css("display", "block");
      errors.push(false);
    } else {
      $(this).find("#ip").css("border", "none");
      $(this).find(".ip-error").css("display", "none");
    }

    if (isNumeric(kIdValue) === false) {
      $(this).find("#k_id").css("border", "1px solid red");
      $(this).find(".kid-error").css("display", "block");
      errors.push(false);
    } else {
      $(this).find("#k_id").css("border", "none");
      $(this).find(".kid-error").css("display", "none");
    }

    printer.ip = ipValue;
    console.log(parseInt(kIdValue), kIdValue);
    printer.k_id = parseInt(kIdValue);
    printer.print = Boolean(printValue);
    printer.cash_drawer_path=cash_drawer_port;
  });

  if (errors.length === 0) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredData), // Convert the data object to a JSON string
    });

    $(".loader").hide();
    modalEvent(true);
  } else {
    $(".loader").hide();
  }

  errors = [];
}

function renderElements(id, ip, k_id, print, key, element,cash_drawer_port) {
  const elements = `
            <div class="form-group" id=${key}>

                <div class="input-container">
                    <label for="ip">Ip</label>
                    <input id="ip-${key}" value='${ip}' type="text" name="ip" required="required"/>
                    <p class="ip-error">Ip Format is invalid i.e 192.168.1.1 </p>
                </div>
                <div class="input-container">
                    <label for="k_id">K Id</label>
                    <input id="k_id" value='${k_id}' type="text" name="k_id" required="required"/>
                    <p class="kid-error">K Id accept Integer</p>
                </div>

                <div class="input-container">
                    <label for="cash_port">Cash Drawer Port</label>
                    <input id="cash_drawer_port" value='${cash_drawer_port}' type="text" name="cash_drawer_port" required="required"/>
                </div>
                
                <div class="input-container">
                        <label for="ip">Print</label>

                        <label class="switch">
                            <input type="checkbox" id="print" ${
                              print === true ? "checked" : ""
                            }>
                            <span class="slider round"></span>
                        </label>

                </div>
                <div class="btn-container" data-modal-trigger="trigger-1">
                    <button class="trigger-ping" onclick='handlePing(event,"${ip}","${key}")' >
                        Ping
                    </button>
                </div>


                <div onclick='scanIp("${key}","${id}")' class="search-icon">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="white" x="0px" y="0px" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
                        <path d="M 10 2 C 5.5935644 2 2 5.5935677 2 10 C 2 14.406432 5.5935644 18 10 18 C 11.844022 18 13.540969 17.365427 14.896484 16.310547 L 20.292969 21.707031 A 1.0001 1.0001 0 1 0 21.707031 20.292969 L 16.310547 14.896484 C 17.365427 13.540969 18 11.844021 18 10 C 18 5.5935677 14.406436 2 10 2 z M 10 4 C 13.325556 4 16 6.674446 16 10 C 16 13.325554 13.325556 16 10 16 C 6.6744439 16 4 13.325554 4 10 C 4 6.674446 6.6744439 4 10 4 z"></path>
                   </svg>
                </div>

                <div onclick='deleteIp("${key}","${id}")' class="delete-icon">
                  <svg stroke="currentColor" fill="white" stroke-width="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
                </div>
            </div>`;
  element.append(elements);
}

function addIp(key) {
  const containerKey = key.id;
  const element = $(`#${containerKey}`);
  const printerIps = filteredData[containerKey];
  const id = generateId(containerKey);
  renderElements(id, 0, 0, false, containerKey + "-" + id, element,'');
  printerIps.push({
    id: id,
    ip: "",
    print: true,
    k_id: 0,
    cash_drawer_path:''
  });
}

let prevBtn = null;
async function scanIp(key, id) {
  prevBtn = null;
  $(".loader").show();

  const ipsList = "http://localhost:7001/ips-lists";
  const response = await fetch(ipsList);
  const ips = await response.json();

  const modal = document.querySelector(`[data-modal=trigger-3]`);
  const ipsContainer = modal.querySelector("#ips");
  const contentWrapper = modal.querySelector(".content-wrapper");
  const close = modal.querySelector(".close");
  ipsContainer.innerHTML = "";

  ips.forEach((ip, index) => {
    ipList(ipsContainer, ip, key, id, index);
  });

  close.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", () => modal.classList.remove("open"));
  contentWrapper.addEventListener("click", (e) => e.stopPropagation());

  modal.classList.toggle("open");

  $(".loader").hide();
}

const ipList = (ipsContainer, ip, key, id, index) => {
  const ipElement = document.createElement("div");
  ipElement.classList.add("ipItem");

  // Set the text to the IP address
  const ipText = document.createElement("span");
  ipText.textContent = ip;

  // Create the "Select" button
  const selectButton = document.createElement("button");

  selectButton.textContent = "Select";
  selectButton.classList.add("selectBtn");
  const makeId = "selectBtn" + "-" + index;
  selectButton.id = makeId;

  // Add event listener to handle button click
  selectButton.addEventListener("click", () => {
    console.log(ipsContainer, ip, key, id, index);
    if (prevBtn !== null) {
      prevBtn.textContent = "Select";
    }

    const selectBtn = document.getElementById(makeId);
    prevBtn = selectBtn;
    selectBtn.textContent = "UnSelect";
    const splitData = key.split("-");
    const printerIps = filteredData[splitData[0]].find(
      (printer) => printer.id == id
    );
    printerIps.ip = ip;

    document.getElementById(`ip-${key}`).value = ip;
  });

  // Append the IP text and button to the ipElement
  ipElement.appendChild(ipText);
  ipElement.appendChild(selectButton);

  // Append the ipElement to the container
  ipsContainer.appendChild(ipElement);
};

function deleteIp(key, id) {
  const splitData = key.split("-");
  $(`#${key}`).remove();
  const printerIps = filteredData[splitData[0]].filter(
    (printer) => printer.id != id
  );
  filteredData[splitData[0]] = printerIps;
}

function generateId(key) {
  const printerIps = filteredData[key];
  let printerIp = printerIps.reduce(
    (max, obj) => (obj.id > max.id ? obj : max),
    printerIps[0]
  );
  let newId = printerIp?.id + 1 || 1;
  return newId;
}

getPrinters();

// modal
const buttons = document.querySelectorAll(".trigger[data-modal-trigger]");

function modalEvent(pingFlag = false) {
  if (pingFlag) {
    document.getElementById("alive-ip").textContent = "";
    document.getElementById("output-ip").textContent = "";
  }

  const modal = document.querySelector(`[data-modal=trigger-1]`);
  const contentWrapper = modal.querySelector(".content-wrapper");
  const close = modal.querySelector(".close");

  close.addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", () => modal.classList.remove("open"));
  contentWrapper.addEventListener("click", (e) => e.stopPropagation());

  modal.classList.toggle("open");
}

// close modal

function isValidIP(ipAddress) {
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipPattern.test(ipAddress);
}

function isNumeric(value) {
  return /^\d+$/.test(value);
}
