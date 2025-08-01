
let currentScene = 0;
let data;

const width = 600;
const height = 500;
const svg = d3.select("#chart");

d3.csv("maternal_mortality_cleaned.csv").then(raw => {
  data = raw.map(d => ({
    country: d.Country,
    region: d.Region,
    income: d["Income group"],
    mmr: +d.MMR,
    births: +d.LiveBirths
  }));
  updateScene();
});

function updateScene() {
  svg.selectAll("*").remove();
  d3.select("#description").classed("visible", false).html("");

  if (currentScene === 0) {
    drawScene1();
  } else if (currentScene === 1) {
    drawScene2();
  } else if (currentScene === 2) {
    drawScene3();
  }
}

function drawScene1() {
  
  svg.append("defs").append("filter")
    .attr("id", "glow")
    .append("feGaussianBlur")
    .attr("stdDeviation", "3.5")
    .attr("result", "coloredBlur");
  const defs = svg.append("defs");
  defs.append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#333");

const xScale = d3.scalePoint()
    .domain(["Low income", "Lower middle income", "Upper middle income", "High income"])
    .range([100, width - 100]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mmr)]).nice()
    .range([height - 50, 50]);

    const bubbles = svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.income))
    .attr("cy", height - 50)
    .attr("r", d => {
      const r = Math.sqrt(d.births) / 200;
      return (d.country === "Norway" || d.country === "Nigeria") ? Math.max(r, 7) : r;
    })
    .attr("fill", d => {
      if (d.country === "Nigeria") return "crimson";
      if (d.country === "Norway") return "#0077FF";
      return "#89CFF0";
    })
    .attr("opacity", 0.8);

// Create tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "8px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
  .style("pointer-events", "none")
  .style("opacity", 0);

// Add tooltip events
bubbles
  .on("mouseover", (event, d) => {
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.html(`<strong>${d.country}</strong><br>MMR: ${d.mmr}`)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mousemove", event => {
    tooltip
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", () => {
    tooltip.transition().duration(300).style("opacity", 0);
  });


  bubbles.transition()
    .duration(2000)
    .attr("cy", d => yScale(d.mmr))


.on("end", function (event, d) {
  if (d.country === "Nigeria" || d.country === "Norway") {
    const x = xScale(d.income);
    const y = yScale(d.mmr);
    const baseColor = d.country === "Nigeria" ? "crimson" : "#1E90FF";
    const labelColor = d.country === "Nigeria" ? "crimson" : "#003366";

    // Glowing base circle
    svg.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", Math.max(Math.sqrt(d.births) / 200 + 6, 10))
      .attr("fill", baseColor)
      .style("filter", "url(#glow)");

    // Flare pulse ring
    function flare() {
      const ring = svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 8)
        .attr("stroke", baseColor)
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("opacity", 0.6);

      ring.transition()
        .duration(1500)
        .attr("r", 20)
        .attr("opacity", 0)
        .remove()
        .on("end", flare);
    }

    flare();

    // Fade-in country label
    svg.append("text")
      .attr("x", x)
      .attr("y", y - 14)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", labelColor)
      .style("opacity", 0)
      .text(d.country)
      .transition()
      .duration(800)
      .style("opacity", 1);
  }
})

;
  
  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Income Group");

  xScale.domain().forEach(group => {
    svg.append("text")
      .attr("x", xScale(group))
      .attr("y", height - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(group);
  });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Scene 1: MMR vs Income Group");

  const legendData = [
    { label: "Other Countries", color: "#89CFF0" },
    { label: "Nigeria", color: "crimson" },
    { label: "Norway", color: "#0077FF" }
  ];

  svg.selectAll("legend-dots")
    .data(legendData)
    .enter()
    .append("circle")
    .attr("cx", width - 180)
    .attr("cy", (d, i) => 60 + i * 20)
    .attr("r", 6)
    .style("fill", d => d.color);

  svg.selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", width - 165)
    .attr("y", (d, i) => 65 + i * 20)
    .text(d => d.label)
    .attr("text-anchor", "start")
    .style("alignment-baseline", "middle");

  
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Maternal Mortality Ratio (MMR)");
// Set description with visible class
  d3.select("#description")
    .classed("visible", true)
    .html(`
      <h2>Understanding Maternal Mortality & Income</h2>
      <p>
        This scene presents a bubble chart showing the <strong>Maternal Mortality Ratio (MMR)</strong> across different <strong>income groups</strong>.
        Each bubble represents a country, sized by the number of <strong>live births</strong>.
        Countries like <span style='color:crimson; font-weight:bold;'>Nigeria</span> show high MMR despite many births,
        while <span style='color:darkblue; font-weight:bold;'>Norway</span> has low MMR, reflecting the disparities in healthcare outcomes.
      </p>
    `);
}

function drawScene2() {
  
  d3.csv("global_mmr_cleaned.csv").then(raw => {
    const parsedData = raw.map(d => ({
      year: +d.Year,
      mmr: +d.Global_MMR
    })).sort((a, b) => a.year - b.year);

    const margin = { top: 50, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(parsedData, d => d.year))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.mmr)]).nice()
      .range([innerHeight, 0]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.mmr))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    g.append("g")
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Year");

    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Global Maternal Mortality Ratio");
    d3.select("#description")
      .classed("visible", true)
      .html(`
        <h2>Global Trends in Maternal Mortality</h2>
        <p>
          While Scene 1 illustrated the sharp contrast in maternal mortality across income groups for a single year, 
          this scene zooms out to examine the <strong>global trend over time</strong>.
          Tracking the <strong>Maternal Mortality Ratio (MMR)</strong> from 2000 onward, we can see whether 
          healthcare improvements are reducing maternal deaths worldwide.
        </p>
        <p>
          Encouragingly, the chart shows a general <strong>downward trend</strong>, suggesting that 
          global efforts in maternal health — including increased access to skilled birth attendants, 
          emergency obstetric care, and education — are making a measurable impact.
        </p>
    `);
  });
}

function drawScene3() {
  d3.select("#controls").remove(); // Remove any existing filter panel
  d3.select("#sidebar").remove();  // Remove existing sidebar

  const years = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => +a - +b);
  const regions = Array.from(new Set(data.map(d => d.Region))).sort();
  const incomeGroups = Array.from(new Set(data.map(d => d["Income group"]))).sort();

  // Create control panel
  const controls = d3.select("body").insert("div", "#chart")
    .attr("id", "controls")
    .style("margin-bottom", "20px")
    .style("display", "flex")
    .style("gap", "20px")
    .style("justify-content", "center");

  const dropdown = (label, options, id) => {
    const div = controls.append("div");
    div.append("label").text(label + ": ").style("font-weight", "bold");
    const select = div.append("select").attr("id", id);
    select.append("option").text("All").attr("value", "");
    options.forEach(opt => {
      select.append("option").text(opt).attr("value", opt);
    });
  };

  dropdown("Region", regions, "region-filter");
  dropdown("Income Group", incomeGroups, "income-filter");
  dropdown("Year", years, "year-filter");

  // Sidebar
  const sidebar = d3.select("body").append("div")
    .attr("id", "sidebar")
    .style("position", "absolute")
    .style("top", "150px")
    .style("right", "40px")
    .style("width", "260px")
    .style("background", "#f4f4f4")
    .style("padding", "15px")
    .style("border-left", "3px solid #3498db")
    .style("display", "none")
    .style("font-size", "14px");

  const updateChart = () => {
    const selectedRegion = d3.select("#region-filter").property("value");
    const selectedIncome = d3.select("#income-filter").property("value");
    const selectedYear = d3.select("#year-filter").property("value");

    const filteredData = data.filter(d => {
      return (!selectedRegion || d.Region === selectedRegion) &&
             (!selectedIncome || d["Income group"] === selectedIncome) &&
             (!selectedYear || d.Year === selectedYear);
    });

    const x = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.LiveBirths)]).nice()
      .range([80, width - 100]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.MMR)]).nice()
      .range([height - 50, 50]);

    svg.selectAll("*").remove();

    svg.append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(80,0)`)
      .call(d3.axisLeft(y));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Live Births");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Maternal Mortality Ratio");

    svg.selectAll("circle")
      .data(filteredData)
      .join("circle")
      .attr("cx", d => x(d.LiveBirths))
      .attr("cy", d => y(d.MMR))
      .attr("r", 6)
      .attr("fill", "#3498db")
      .attr("opacity", 0.75)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).transition().attr("r", 9);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(
          `<strong>${d.Country}</strong><br>MMR: ${d.MMR}<br>Births: ${d.LiveBirths}<br>${d.Region}<br>${d["Income group"]}<br>${d.Year}`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).transition().attr("r", 6);
        tooltip.transition().duration(300).style("opacity", 0);
      })
      .on("click", (event, d) => {
        sidebar.style("display", "block").html(`
          <h3>${d.Country}</h3>
          <p><strong>Region:</strong> ${d.Region}</p>
          <p><strong>Income Group:</strong> ${d["Income group"]}</p>
          <p><strong>MMR:</strong> ${d.MMR}</p>
          <p><strong>Live Births:</strong> ${d.LiveBirths}</p>
          <p><strong>Year:</strong> ${d.Year}</p>
        `);
      });
  };

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
    .style("opacity", 0);

  d3.selectAll("#region-filter, #income-filter, #year-filter").on("change", updateChart);

  updateChart();
}

d3.select("#next").on("click", () => {
  currentScene = (currentScene + 1) % 3;
  updateScene();
});

d3.select("#prev").on("click", () => {
  currentScene = (currentScene - 1 + 3) % 3;
  updateScene();
});
