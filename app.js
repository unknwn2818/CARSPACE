// Vehicle data used across catalogue, compare, finance and booking pages
const vehicles = [
  {
    id: "aurora",
    name: "Aurora E1",
    type: "Electric",
    price: 38990,
    range: 310,
    charge: "34 minutes",
    seats: 5,
    body: "SUV",
    image: "assets/car-aurora.svg",
    features: ["Long range battery", "Rapid charging", "Panoramic roof", "Driver assist"],
    colours: ["Glacier White", "Midnight Blue", "Electric Cyan"]
  },
  {
    id: "nova",
    name: "Nova Hybrid",
    type: "Hybrid",
    price: 28990,
    range: 560,
    charge: "Self charging hybrid",
    seats: 5,
    body: "Family car",
    image: "assets/car-nova.svg",
    features: ["Low fuel use", "Family storage", "Reverse camera", "Comfort pack"],
    colours: ["Pearl Silver", "Ocean Green", "Charcoal Black"]
  },
  {
    id: "pulse",
    name: "Pulse R",
    type: "Electric",
    price: 31990,
    range: 265,
    charge: "28 minutes",
    seats: 5,
    body: "Hatchback",
    image: "assets/car-pulse.svg",
    features: ["Sport mode", "Compact size", "Fast charging", "Digital cockpit"],
    colours: ["Ruby Red", "Glacier White", "Charcoal Black"]
  },
  {
    id: "summit",
    name: "Summit X",
    type: "Electric",
    price: 46990,
    range: 365,
    charge: "39 minutes",
    seats: 5,
    body: "Estate",
    image: "assets/car-summit.svg",
    features: ["Large boot", "Long range", "Premium interior", "Heated seats"],
    colours: ["Forest Green", "Midnight Blue", "Pearl Silver"]
  }
];

const paintColours = {
  "Glacier White": "#e8f3ff",
  "Midnight Blue": "#0d1b2a",
  "Electric Cyan": "#00c8ff",
  "Pearl Silver": "#cbd5e1",
  "Ocean Green": "#0b6e69",
  "Charcoal Black": "#111827",
  "Ruby Red": "#e11d48",
  "Forest Green": "#10b981"
};

const money = value => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
const byId = id => document.getElementById(id);
const selectedIds = () => JSON.parse(localStorage.getItem("drivespaceCompare") || "[]");
const setSelectedIds = ids => localStorage.setItem("drivespaceCompare", JSON.stringify(ids.slice(0, 3)));

// Mobile navigation toggle
function setupNavigation() {
  const button = byId("navToggle");
  const menu = byId("navLinks");
  if (!button || !menu) return;

  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

// Reusable vehicle card template
function vehicleCard(vehicle, showCompare = true) {
  const selected = selectedIds().includes(vehicle.id);
  const compareButton = showCompare
    ? `<button class="btn btn-light" data-compare="${vehicle.id}">${selected ? "Added ✓" : "Add to compare"}</button>`
    : "";

  return `
    <article class="vehicle-card">
      <img src="${vehicle.image}" alt="${vehicle.name} ${vehicle.type.toLowerCase()} vehicle">
      <div class="vehicle-card-body">
        <h3>${vehicle.name}</h3>
        <p class="muted">${vehicle.body} designed for modern EV and hybrid buyers.</p>
        <div class="spec-row">
          <span class="badge ${vehicle.type === "Hybrid" ? "hybrid" : ""}">${vehicle.type}</span>
          <span class="badge">${vehicle.range} miles</span>
          <span class="badge">From ${money(vehicle.price)}</span>
        </div>
        <div class="actions">
          <a class="btn btn-dark" href="configurator.html?car=${vehicle.id}">Configure</a>
          ${compareButton}
        </div>
      </div>
    </article>`;
}

function setupFeaturedVehicles() {
  const holder = byId("featuredVehicles");
  if (!holder) return;
  holder.innerHTML = vehicles.slice(0, 3).map(vehicle => vehicleCard(vehicle)).join("");
  setupCompareButtons();
}

// Catalogue filtering and sorting
function setupVehiclePage() {
  const grid = byId("vehicleGrid");
  const resultCount = byId("resultCount");
  if (!grid) return;

  const controls = {
    search: byId("searchInput"),
    type: byId("typeFilter"),
    maxPrice: byId("priceFilter"),
    minRange: byId("rangeFilter"),
    sort: byId("sortFilter")
  };

  const render = () => {
    const term = controls.search.value.trim().toLowerCase();
    const type = controls.type.value;
    const maxPrice = Number(controls.maxPrice.value || 999999);
    const minRange = Number(controls.minRange.value || 0);

    let results = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(term) || vehicle.body.toLowerCase().includes(term);
      const matchesType = type === "All" || vehicle.type === type;
      return matchesSearch && matchesType && vehicle.price <= maxPrice && vehicle.range >= minRange;
    });

    if (controls.sort.value === "priceLow") results.sort((a, b) => a.price - b.price);
    if (controls.sort.value === "priceHigh") results.sort((a, b) => b.price - a.price);
    if (controls.sort.value === "rangeHigh") results.sort((a, b) => b.range - a.range);

    resultCount.textContent = `Showing ${results.length} vehicle${results.length === 1 ? "" : "s"}`;
    grid.innerHTML = results.length
      ? results.map(vehicle => vehicleCard(vehicle)).join("")
      : `<div class="notice warning">No vehicles match your filters. Try changing the price, range or vehicle type.</div>`;
    setupCompareButtons();
  };

  Object.values(controls).forEach(control => control.addEventListener("input", render));
  render();
}

// Stores selected compare vehicles in local storage
function setupCompareButtons() {
  document.querySelectorAll("[data-compare]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.compare;
      const current = selectedIds();

      if (current.includes(id)) {
        setSelectedIds(current.filter(item => item !== id));
        button.textContent = "Add to compare";
        return;
      }

      if (current.length >= 3) {
        alert("You can compare up to three vehicles at a time.");
        return;
      }

      current.push(id);
      setSelectedIds(current);
      button.textContent = "Added ✓";
    });
  });
}

// Builds the side-by-side comparison table
function setupComparePage() {
  const holder = byId("compareHolder");
  if (!holder) return;

  const render = () => {
    const items = vehicles.filter(vehicle => selectedIds().includes(vehicle.id));

    if (!items.length) {
      holder.innerHTML = `
        <div class="notice warning">
          No vehicles have been selected yet. Go to the Vehicles page and choose up to three cars to compare.
        </div>
        <p><a class="btn btn-primary" href="vehicles.html">Choose vehicles</a></p>`;
      return;
    }

    const rows = [
      ["Starting price", ...items.map(v => money(v.price))],
      ["Type", ...items.map(v => v.type)],
      ["Body style", ...items.map(v => v.body)],
      ["Estimated range", ...items.map(v => `${v.range} miles`)],
      ["Charging", ...items.map(v => v.charge)],
      ["Seats", ...items.map(v => v.seats)],
      ["Key features", ...items.map(v => v.features.join(", "))]
    ];

    holder.innerHTML = `
      <table class="compare-table">
        <thead>
          <tr>
            <th>Specification</th>
            ${items.map(v => `<th>${v.name}<br><button class="btn btn-light" data-remove="${v.id}">Remove</button></th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr><td><strong>${row[0]}</strong></td>${row.slice(1).map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>`;

    document.querySelectorAll("[data-remove]").forEach(button => {
      button.addEventListener("click", () => {
        setSelectedIds(selectedIds().filter(id => id !== button.dataset.remove));
        render();
      });
    });
  };

  render();
}

// Configurator updates colour, trim, package and price
function setupConfigurator() {
  const form = byId("configuratorForm");
  if (!form) return;

  const carSelect = byId("configCar");
  const colourSelect = byId("configColour");
  const trimSelect = byId("configTrim");
  const packSelect = byId("configPack");
  const summary = byId("configSummary");
  const preview = byId("previewShape");

  carSelect.innerHTML = "";
  vehicles.forEach(vehicle => carSelect.insertAdjacentHTML("beforeend", `<option value="${vehicle.id}">${vehicle.name}</option>`));

  const params = new URLSearchParams(window.location.search);
  if (params.has("car")) carSelect.value = params.get("car");

  const updateColourOptions = () => {
    const vehicle = vehicles.find(item => item.id === carSelect.value) || vehicles[0];
    colourSelect.innerHTML = vehicle.colours.map(colour => `<option value="${colour}">${colour}</option>`).join("");
  };

  const calculate = () => {
    const vehicle = vehicles.find(item => item.id === carSelect.value) || vehicles[0];
    const trimCost = Number(trimSelect.value);
    const packCost = Number(packSelect.value);
    const colour = colourSelect.value;
    const total = vehicle.price + trimCost + packCost;

    preview.style.setProperty("--car-paint", paintColours[colour] || "#dfe8f3");
    summary.innerHTML = `
      <h3>Your ${vehicle.name}</h3>
      <p><strong>Colour:</strong> ${colour}</p>
      <p><strong>Trim:</strong> ${trimSelect.options[trimSelect.selectedIndex].text}</p>
      <p><strong>Package:</strong> ${packSelect.options[packSelect.selectedIndex].text}</p>
      <p class="big-number">${money(total)}</p>
      <p class="muted">Estimated price before finance options.</p>`;
  };

  carSelect.addEventListener("change", () => {
    updateColourOptions();
    calculate();
  });
  [colourSelect, trimSelect, packSelect].forEach(input => input.addEventListener("change", calculate));
  updateColourOptions();
  calculate();
}

// Finance calculator validates input and estimates monthly cost
function setupFinanceCalculator() {
  const form = byId("financeForm");
  if (!form) return;

  const vehicleSelect = byId("financeVehicle");
  const deposit = byId("deposit");
  const term = byId("term");
  const result = byId("financeResult");
  const error = byId("financeError");

  vehicleSelect.innerHTML = "";
  vehicles.forEach(vehicle => vehicleSelect.insertAdjacentHTML("beforeend", `<option value="${vehicle.id}">${vehicle.name} - ${money(vehicle.price)}</option>`));

  const calculate = () => {
    const vehicle = vehicles.find(item => item.id === vehicleSelect.value) || vehicles[0];
    const depositValue = Number(deposit.value);
    const months = Number(term.value);

    if (depositValue < 0 || depositValue >= vehicle.price) {
      error.textContent = "Enter a deposit lower than the vehicle price.";
      result.innerHTML = "";
      return;
    }

    error.textContent = "";
    const amount = vehicle.price - depositValue;
    const apr = 0.079;
    const monthlyRate = apr / 12;
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const total = payment * months + depositValue;

    result.innerHTML = `
      <p class="muted">Estimated monthly payment</p>
      <p class="big-number">${money(payment)}</p>
      <p><strong>Vehicle:</strong> ${vehicle.name}</p>
      <p><strong>Deposit:</strong> ${money(depositValue)}</p>
      <p><strong>Term:</strong> ${months} months</p>
      <p><strong>Total repayable:</strong> ${money(total)}</p>
      <p class="help-text">This is an estimate only and not a credit agreement.</p>`;
  };

  form.addEventListener("input", calculate);
  calculate();
}

// Three-step booking form with built-in validation
function setupBookingForm() {
  const form = byId("bookingForm");
  if (!form) return;

  const steps = Array.from(document.querySelectorAll(".booking-step"));
  const stepLabels = Array.from(document.querySelectorAll(".stepper li"));
  const vehicleSelect = byId("bookingVehicle");
  const confirmation = byId("bookingConfirmation");
  let step = 0;

  vehicleSelect.innerHTML = "";
  vehicles.forEach(vehicle => vehicleSelect.insertAdjacentHTML("beforeend", `<option value="${vehicle.id}">${vehicle.name}</option>`));

  const showStep = index => {
    step = index;
    steps.forEach((section, i) => section.hidden = i !== step);
    stepLabels.forEach((label, i) => label.classList.toggle("active", i === step));
  };

  const validStep = () => {
    const visibleInputs = Array.from(steps[step].querySelectorAll("input, select"));
    return visibleInputs.every(input => input.checkValidity());
  };

  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", () => {
      if (!validStep()) {
        form.reportValidity();
        return;
      }
      showStep(Math.min(step + 1, steps.length - 1));
    });
  });

  document.querySelectorAll("[data-back]").forEach(button => {
    button.addEventListener("click", () => showStep(Math.max(step - 1, 0)));
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const vehicle = vehicles.find(item => item.id === vehicleSelect.value);
    const date = byId("bookingDate").value;
    const time = byId("bookingTime").value;
    const name = byId("customerName").value.trim();

    confirmation.hidden = false;
    confirmation.innerHTML = `<strong>Booking confirmed.</strong> ${name}, your ${vehicle.name} test drive is booked for ${date} at ${time}. A confirmation message would be sent to your email.`;
    form.reset();
    showStep(0);
  });

  showStep(0);
}

// Contact form confirmation message
function setupContactForm() {
  const form = byId("contactForm");
  const result = byId("contactResult");
  if (!form || !result) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    result.hidden = false;
    result.textContent = "Thank you. Your enquiry has been recorded for the DriveSpace team.";
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupFeaturedVehicles();
  setupVehiclePage();
  setupComparePage();
  setupConfigurator();
  setupFinanceCalculator();
  setupBookingForm();
  setupContactForm();
});
