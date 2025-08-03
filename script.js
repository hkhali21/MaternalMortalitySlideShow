
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

  // Show instructions only in Scene 3
  const instructions = d3.select("#scene3-instructions");
  instructions.style("display", currentScene === 2 ? "block" : "none");

  if (currentScene === 0) {
    drawScene1();
  } else if (currentScene === 1) {
    drawScene2();
  } else if (currentScene === 2) {
    drawScene3();
  } else if (currentScene === 3) {
    drawScene4(); // 
  }
}


function drawScene1() {
  d3.select("#region-info").classed("visible", false).style("display", "none");

  d3.select("#region-legend").style("display", "none");
  d3.select("#scene3-wrapper").style("display", "none");

  d3.select("#map-wrapper").style("transform", "translateY(0px)");
  d3.select(".viz-container").style("display", "flex");
  d3.select("#description").style("display", "block");
  d3.select("#scene4").style("display", "none");
  d3.select("#map").style("display", "none");
  d3.select("#region-info").style("display", "none");


  d3.select("#chart").style("display", "block");

  d3.select("#country-detail").style("display", "none");
  
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
        This Slide presents a bubble chart showing the <strong>Maternal Mortality Ratio (MMR)</strong> across different <strong>income groups</strong>.
        Each bubble represents a country, sized by the number of <strong>live births</strong>.
        Countries like <span style='color:crimson; font-weight:bold;'>Nigeria</span> show high MMR despite many births,
        while <span style='color:darkblue; font-weight:bold;'>Norway</span> has low MMR, reflecting the disparities in healthcare outcomes.
      </p>
    `);
}

function drawScene2() {
  d3.select("#region-info").classed("visible", false).style("display", "none");

  d3.select("#region-legend").style("display", "none");
  d3.select("#scene3-wrapper").style("display", "none");

  d3.select("#map-wrapper").style("transform", "translateY(0px)");
  d3.select(".viz-container").style("display", "flex");
  d3.select("#description").style("display", "block");
  d3.select("#scene4").style("display", "none");
  d3.select("#map").style("display", "none");
  d3.select("#region-info").style("display", "none");


  d3.select("#chart").style("display", "block");

  d3.select("#country-detail").style("display", "none");
  
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

    const path = g.append("path")
  .datum(parsedData)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr("d", line);

// Animate the line drawing
const totalLength = path.node().getTotalLength();

path
  .attr("stroke-dasharray", totalLength + " " + totalLength)
  .attr("stroke-dashoffset", totalLength)
  .transition()
  .duration(2500)
  .ease(d3.easeCubic)
  .attr("stroke-dashoffset", 0);


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
          While Slide1 illustrated the sharp contrast in maternal mortality across income groups for a single year, 
          this slide zooms out to examine the <strong>global trend over time</strong>.
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

function clearScene() {
  document.querySelectorAll("div, section, article").forEach(el => {
    el.innerHTML = "";
  });

  // Remove all paragraphs
  document.querySelectorAll("p").forEach(el => {
    el.remove();
  });
  // Remove all SVGs
  d3.selectAll("svg").remove();

  //  clear any other chart containers
  d3.selectAll(".chart").html("");  // 

  // Clear any explanation text or dynamic HTML elements
  d3.selectAll(".explanation").html("");
  d3.selectAll(".sidebar").html("");
}



function drawScene3() {
  // d3.select("#viz-container").style("display", "none");
  scene4
  d3.select(".viz-container").style("display", "none");
  d3.select("#chart").style("display", "none");
  d3.select("#description").style("display", "none");
  d3.select("#scene3-wrapper").style("display", "flex");

  d3.select("#region-info").style("display", "block");
  d3.select("#country-detail").style("display", "none");
  d3.select("#scene4").style("display", "none");

  // d3.select("#map").style("display", "block");
 d3.select("#map-wrapper")
  .style("display", "flex")
  .style("transform", "translateY(0px)");

d3.select("#map")
  .style("display", "block");

  


  const svg = d3.select("#map");
const width = 960, height = 500;
svg.attr("width", width).attr("height", height);

const projection = d3.geoNaturalEarth1().scale(180).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const regionColor = d3.scaleOrdinal()
  .domain([
    "East Asia & Pacific", "Europe & Central Asia", "Latin America & Caribbean",
    "Middle East, North Africa, Afghanistan & Pakistan", "North America",
    "South Asia", "Sub-Saharan Africa"
  ])
  .range(d3.schemeTableau10);

let regionMap = new Map();
let regionGroups = new Map();

Promise.all([
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.csv("global_mmr_dashboard_ready.csv")
]).then(([world, data]) => {
  const countries = topojson.feature(world, world.objects.countries).features;

  data.forEach(d => {
    const country = d.Country.trim();
    const region = d.Region.trim();
    regionMap.set(country, region);
    if (!regionGroups.has(region)) regionGroups.set(region, new Set());
    regionGroups.get(region).add(country);
  });
  
const svg = d3.select("#map");

  svg.selectAll(".region")
    .data(countries)
    .enter()
    .append("path")
    .attr("class", "region")
    .attr("d", path)
    .attr("fill", d => {
      const match = data.find(row => row.iso_alpha_3_code === d.id);
      return match ? regionColor(match.Region) : "#ccc";
    })
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity", 0.7);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("opacity", 1);
    })
    .on("click", function(event, d) {
      const match = data.find(row => row.iso_alpha_3_code === d.id);
      if (!match) return;

      const regionName = match.Region;

      const countriesInRegion = data
        .filter(row => row.Region === regionName)
        .map(row => row.Country);

      const uniqueCountries = Array.from(new Set(countriesInRegion)).sort();

      const regionInfo = d3.select("#region-info");
      regionInfo
        .classed("visible", true)
        .html(`<strong>Countries in ${regionName}:</strong><ul>${uniqueCountries.map(c => `<li>${c}</li>`).join("")}</ul>`);
    });



  //  region legend only in Scene 3
const regionLegend = d3.select("#region-legend");
regionLegend.style("display", "block").html(""); // Clear before adding

const regionColors = regionColor.domain().map(region => ({
  region,
  color: regionColor(region)
}));

regionColors.forEach(d => {
  regionLegend.append("div").html(`
    <div class="color-box" style="background:${d.color};"></div>
    <span>${d.region}</span>
  `);
});



  const dataByCountry = d3.group(data, d => d.Country);

  const paths = svg.selectAll("path")
    .data(countries)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const name = d.properties.name;
      const region = regionMap.get(name);
      return region ? regionColor(region) : "#ccc";
    })
    .attr("class", d => {
      const name = d.properties.name;
      return regionMap.has(name) ? "region" : "hidden";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.7)
    .on("mouseover", function (event, d) {
      const country = d.properties.name;
      const region = regionMap.get(country);
      if (!region) return;
      d3.selectAll("path").attr("opacity", 0.2);
      d3.selectAll(`.region-${region.replace(/\W/g, '')}`).attr("opacity", 1);
      showTooltip(region, event.pageX, event.pageY);
    })
    .on("mouseout", () => {
      d3.selectAll("path").attr("opacity", 1);
      hideTooltip();
    })
    .on("click", (event, d) => {
      const country = d.properties.name;
      const region = regionMap.get(country);
      if (region) highlightRegion(region);
    });

  paths.each(function (d) {
    const country = d.properties.name;
    const region = regionMap.get(country);
    if (region) {
      d3.select(this).classed(`region-${region.replace(/\W/g, '')}`, true);
    }
  });

  function highlightRegion(region) {
    d3.select("#map-wrapper")
  .transition()
  .duration(600)
  .style("transform", "translateY(-10px)");
 d3.select("#country-detail")
  .transition().duration(500)
  .style("opacity", 0)
  .on("end", () => d3.select("#country-description").html(""));

d3.select("#region-info")
  .style("opacity", 0)
  .html(`<h3>${region}</h3><p>Click a country to see details:</p>`);

const list = d3.select("#region-info").append("ul");
Array.from(regionGroups.get(region)).sort().forEach(c => {
  list.append("li")
    .text(c)
    .style("cursor", "pointer")
    .style("color", "#007acc")
    .on("click", () => showCountryDetails(c));
});

// Fade the list in smoothly
d3.select("#region-info")
  .transition().duration(800)
  .style("opacity", 1);

  }

  function showCountryDetails(countryName) {
    d3.select("#country-detail")
  .style("display", "flex");
    d3.select("#region-info")
      .transition()
      .duration(600)
      .style("opacity", 0)
      .on("end", () => d3.select("#region-info").html(""));
    const countryData = dataByCountry.get(countryName);
    if (!countryData || countryData.length === 0) return;

    const latest = countryData[countryData.length - 1];
    const detail = d3.select("#country-detail");
detail.style("opacity", 0).style("transform", "translateY(30px)");

    const region = latest.Region;
    const incomeGroup = latest["Income group"];
    const mmr = +latest.MMR;
    const births = +latest.LiveBirths;

    const regionData = data.filter(d => d.Region === region && +d.MMR > 0);
    const grouped = Array.from(d3.group(regionData, d => d["Income group"]), 
      ([key, values]) => ({
        incomeGroup: key,
        avgMMR: d3.mean(values, v => +v.MMR * 100000)
      })
    );

    const lowIncome = grouped.find(g => g.incomeGroup.toLowerCase().includes("low"));
    const highIncome = grouped.find(g => g.incomeGroup.toLowerCase().includes("high"));

    
    let interpretation = "";
    if (incomeGroup.toLowerCase().includes("high")) {
      interpretation = `
        ${latest.Country} belongs to the <strong>high income</strong> group within the ${region} region. 
        Countries in this category typically exhibit much lower maternal mortality ratios (MMR) due to robust healthcare systems, better access to maternal care, 
        and higher healthcare spending. With an MMR of <strong>${mmr}</strong> and <strong>${births.toLocaleString()}</strong> live births, 
        ${latest.Country}'s outcomes reflect how socioeconomic strength translates into life-saving medical support. 
        The bar chart and bubble chart both highlight this advantage, showing smaller bubbles and lower MMR bars compared to lower-income peers.`;
    } else if (lowIncome && highIncome) {
      interpretation = `
        In ${region}, a significant disparity exists between income levels and maternal outcomes. 
        Countries categorized as <strong>low income</strong> have an average maternal mortality ratio of 
        <strong>${Math.round(lowIncome.avgMMR)}</strong> deaths per 100,000 live births — a stark contrast 
        to the <strong>${Math.round(highIncome.avgMMR)}</strong> seen in <strong>high income</strong> nations within the same region.
        This suggests that limited access to quality healthcare, poor infrastructure, and economic hardship 
        in low income countries contribute heavily to maternal deaths. Meanwhile, high income countries, 
        benefiting from advanced medical systems and robust healthcare policies, are able to dramatically reduce 
        such risks. The bar chart highlights how economic status often draws the line between life and death 
        for expectant mothers.`;
    } else {
      interpretation = `
        The available data suggests that income group has a noticeable effect on maternal health outcomes. 
        While high income countries tend to perform better due to stronger healthcare systems, low and lower-middle 
        income countries still face substantial challenges that directly impact maternal mortality.`;
    }


    const paragraph = `
      <h3>${latest.Country}</h3>
      <p>${latest.Country} is located in the ${region} region and belongs to the ${incomeGroup} income group. 
      In the most recent year, it recorded a maternal mortality ratio (MMR) of <strong>${mmr}</strong>, 
      with approximately <strong>${births.toLocaleString()}</strong> live births.</p>
      ${interpretation}
    `;

    d3.select("#country-description").html(paragraph);


    showRegionIncomeGroupBarChart(latest.Region);

    // Bubble Chart: income group (x), avgMMR (y), bubble size = live births
    const bubbleSvg = d3.select("#bubble-svg");
    bubbleSvg.selectAll("*").remove();

    const bubbleMargin = { top: 40, right: 40, bottom: 60, left: 70 },
          bubbleWidth = +bubbleSvg.attr("width") - bubbleMargin.left - bubbleMargin.right,
          bubbleHeight = +bubbleSvg.attr("height") - bubbleMargin.top - bubbleMargin.bottom;

    const bubbleG = bubbleSvg.append("g")
      .attr("transform", `translate(${bubbleMargin.left},${bubbleMargin.top})`);

    bubbleSvg.append("text")
  .attr("x", bubbleMargin.left + bubbleWidth / 2)
  .attr("y", 15)  // higher up
  .attr("text-anchor", "middle")
  .style("font-size", "14px")  // slightly smaller
  .style("font-weight", "bold")
  .text("Bubble Chart: Avg MMR vs Income Group (Region)");

      const bubbleData = Array.from(d3.group(regionData, d => d["Income group"]),
      ([key, values]) => ({
        incomeGroup: key,
        avgMMR: d3.mean(values, v => +v.MMR * 100000),
        totalBirths: d3.sum(values, v => +v.LiveBirths)
      }));

    const xB = d3.scalePoint()
      .domain(bubbleData.map(d => d.incomeGroup))
      .range([0, bubbleWidth])
      .padding(0.5);

    const yB = d3.scaleLinear()
      .domain([0, d3.max(bubbleData, d => d.avgMMR) * 1.1])
      .range([bubbleHeight, 0]);

    const rB = d3.scaleSqrt()
      .domain([0, d3.max(bubbleData, d => d.totalBirths)])
      .range([5, 40]);

    const colorB = d3.scaleOrdinal()
      .domain(bubbleData.map(d => d.incomeGroup))
      .range(d3.schemeTableau10);

    bubbleG.append("g")
  .attr("transform", `translate(0,${bubbleHeight})`)
  .call(d3.axisBottom(xB))
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-0.8em")
  .attr("dy", "0.15em")
  .attr("transform", "rotate(-30)");


    bubbleG.append("g")
      .call(d3.axisLeft(yB));

    bubbleG.selectAll("circle")
      .data(bubbleData)
      .join("circle")
      .attr("cx", d => xB(d.incomeGroup))
      .attr("cy", d => yB(d.avgMMR))
      .attr("r", 0)
      .attr("fill", d => colorB(d.incomeGroup))
      .style("opacity", 0.7)
      .transition()
      .duration(1600)
      .attr("r", d => rB(d.totalBirths));

    
    let bubbleText = "";

    if (incomeGroup.toLowerCase().includes("high")) {
      bubbleText = `
        <p><strong>Bubble Chart Insight:</strong> As a high income country, ${latest.Country} benefits from systemic healthcare advantages that lead to lower maternal mortality.
        In the bubble chart, this is reflected by a smaller MMR position on the vertical axis and generally smaller or moderate bubble size due to fewer live births. 
        Compared to low income countries, the contrast is clear — those nations often show both larger bubbles (higher birth counts) and higher MMRs, 
        revealing an urgent need for healthcare equity and investment in maternal care infrastructure in less affluent settings.</p>
      `;
    } else {
      bubbleText = `
        <p><strong>Bubble Chart Insight:</strong> On the right, each bubble represents an income group in the region.
        The x-axis categorizes them by income, the y-axis shows their average maternal mortality ratio (MMR),
        and the bubble size reflects the number of live births. The chart reveals a pattern: lower income groups,
        despite having larger populations and more live births, tend to have significantly higher MMRs.
        This highlights systemic inequalities in maternal care access and healthcare quality.</p>
      `;
    }

   d3.select("#bubble-description").html(bubbleText);


    detail.transition().duration(800)
  .style("opacity", 1)
  .style("transform", "translateY(0px)");
  }
function showRegionIncomeGroupBarChart(region) {
  const grouped = Array.from(d3.group(data.filter(d => d.Region === region && +d.MMR > 0),
    d => d["Income group"]), ([key, values]) => ({
      incomeGroup: key,
      avgMMR: d3.mean(values, v => +v.MMR * 100000)
    }));

  const svg = d3.select("#bubble-chart");
  svg.selectAll("*").remove();  // 

  const margin = { top: 40, right: 20, bottom: 40, left: 60 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;

  const color = d3.scaleOrdinal()
    .domain(grouped.map(d => d.incomeGroup))
    .range(d3.schemeCategory10);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("text")
  .attr("x", margin.left + width / 2)
  .attr("y", 20)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .style("font-weight", "bold")
  .text("Bar Chart: Avg MMR by Income Group(Country)");

  const x = d3.scaleBand()
    .domain(grouped.map(d => d.incomeGroup))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(grouped, d => d.avgMMR)])
    .nice()
    .range([height, 0]);

  g.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
  .style("text-anchor", "end")
  .style("font-size", "6px")
  .attr("dx", "-0.8em")
  .attr("dy", "0.15em")
  .attr("transform", "rotate(-30)");


  g.append("g").call(d3.axisLeft(y));

  g.selectAll(".bar")
    .data(grouped)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.incomeGroup))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", d => color(d.incomeGroup))
    .transition()
    .duration(1800)
    .attr("y", d => y(d.avgMMR))
    .attr("height", d => height - y(d.avgMMR));

  // 
  // const legend = svg.append("g")
  //   .attr("transform", `translate(${margin.left}, 10)`);

  // grouped.forEach((d, i) => {
  //   const legendRow = legend.append("g")
  //     .attr("transform", `translate(${i * 140}, 0)`);

  //   legendRow.append("rect")
  //     .attr("width", 12)
  //     .attr("height", 12)
  //     .attr("fill", color(d.incomeGroup));

  //   legendRow.append("text")
  //     .attr("x", 18)
  //     .attr("y", 10)
  //     .text(d.incomeGroup)
  //     .style("font-size", "12px")
  //     .attr("alignment-baseline", "middle");
  // });
}

  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "#222")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  function showTooltip(text, x, y) {
    tooltip.style("left", x + 10 + "px")
      .style("top", y + 10 + "px")
      .style("opacity", 0.9)
      .text(text);
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }
});
}


// SCENE4 

function showFamilyDetail(family) {
  const detail = d3.select("#family-detail");
  detail.style("display", "block");
  detail.html(`
    <h3>${family.name}</h3>
    <p>${family.description}</p>
    <div id="${family.chartId}"></div>
  `);

  drawFamilyChart(family.chartId);
}

const families = [
  {
    name: "Amina Yusuf",
    country: "Somalia",
    region: "Sub-Saharan Africa",
    image: "images/amina.jpg",
    story: `
      <h3>Amina Yusuf – Somalia</h3>
      <img src="images/amina.jpg" alt="Amina" style="width:40%;border-radius:8px;">
      <p>Amina died from postpartum hemorrhage after a 6-hour donkey cart journey to a rural clinic with no trained staff.Here's a chart showing the estimated distance to the nearest clinic for different percentiles of the rural population in Somalia. It visually highlights how the poorest and most remote families — like Amina's — often face journeys of 40–70 km just to access basic maternal care. </p>
      <img src="images/clinic_distance_chart.png" alt="Clinic Distance Chart" style="width:40%;border-radius:8px;">
      <p>Her children were left without care, and her husband quit work, pushing them into deeper poverty.This chart below shows that while skilled birth attendance in Somalia has improved from just 6% in 2000 to about 26% by 2020, the majority of women—especially in rural areas—still give birth without trained medical personnel. This is a key factor in stories like Amina Yusuf’s. </p>
      <img src="images/somalia_chart.png" alt="Clinic Distance Chart" style="width:40%;border-radius:8px;">
    `
  },
  {
    name: "Lalita Devi",
    country: "Nepal",
    region: "South Asia",
    image: "images/lalita.jpg",
    story: `
      <h3>Lalita Devi – Nepal</h3>
      <img src="images/lalita.jpg" alt="Lalita" style="width:40%;border-radius:8px;">
      <p>Died from eclampsia due to untreated high blood pressure and malnutrition. Family couldn't afford prenatal care.</p>
      <img src="images/nepal_map_access.png" alt="Nepal Rural Access" style="width:100%;border-radius:8px;">
      <p>Her daughter dropped out of school to care for younger siblings. For Lalita Devi, who lived in the remote western hills of Nepal, the above map reflects the deadly reality she and thousands of women face:
🔸 Dark green areas (like where Lalita lived) mean very poor access — in some districts, less than 10% of rural people can reach a town within an hour.
🔸 In these places, there are few roads, no ambulances, and walking is often the only option — even in medical emergencies.
🔸 Lighter green areas (eastern Nepal) have better roads and transport, but they’re still exceptions.

So when Lalita went into labor, there was no skilled help nearby. The health post was hours away, and transport was impossible. By the time they reached help, it was too late.

This map isn't just data — it tells the silent story behind why so many mothers like Lalita die:
Not because they’re too sick. But because care is too far.</p>
    <img src="images/chartplaceholder2.png" alt="Nepal Rural Access" style="width:100%;border-radius:8px;">
      <p>This chart illustrates how maternal mortality increases with altitude in Nepal. In lower-altitude areas (<500m), the MMR is around 110. But in high-altitude regions (2500m+), like where Lalita Devi lived, the MMR spikes to over 500.

Why? Because:

Clinics are farther apart.

Roads are scarce or unpaved.

Emergency transport is nearly nonexistent.

This steep rise in risk is not due to geography alone, but to deep inequalities in health infrastructure. Lalita’s life was lost not just to postpartum hemorrhage—but to the altitude-shaped inaccessibility that denied her timely care.</p>

    `
  },
  {
    name: "Josefa Morales",
    country: "Haiti",
    region: "Latin America & Caribbean",
    image: "images/josefa.jpg",
    story: `
      <h3>Josefa Morales – Haiti</h3>
      <img src="images/josefa.jpg" alt="Josefa" style="width:40%;border-radius:8px;">
      <p>Josefa died during childbirth due to lack of electricity and sterile equipment in a makeshift clinic.</p>
      <p>Her youngest child became severely malnourished and had to be placed in an orphanage.</p>
      <img src="images/haiti_facility_access.png" alt="Health Facility Access in Haiti" style="width:100%;border-radius:8px;">
      <p>
            The image above shows how close (or far) people in Haiti live from a health facility.For women like Josefa Morales, this map isn’t abstract—it’s personal.Red and dark orange zones show areas where travel time to a health center exceeds 1–2 hours, often on foot.Josefa lived in a rural commune outside Les Cayes, in one of these underserved zones.
 When she went into labor, there was no clinic nearby, and the only vehicle in her village had broken down months earlier.
Her husband tried carrying her down the hill toward the main road, but by the time they found a motorbike, Josefa had already lost too much blood.
This map tells a hidden truth:In Haiti, nearly 40% of rural residents live more than 5 km from the nearest health facility, often without reliable transport.
Josefa didn’t die because help didn’t exist—she died because it was out of reach.

      </p>
      <img src="images/chart-placeholder3.png" alt="Chart: Health Infrastructure in Rural Haiti" style="width:100%;border-radius:8px;">
      <p>Here's the bar chart showing the health infrastructure in rural Haiti—supporting Josefa Morales' story:

Only 27% of rural facilities have skilled birth attendants.

Just 12% offer emergency transport.

Fewer than 1 in 5 operate 24/7.

This illustrates the deadly gaps Josefa faced in reaching lifesaving maternal care.</p>
    `
  },
  {
    name: "Zahra Al-Mansoori",
    country: "Yemen",
    region: "Middle East & North Africa",
    image: "images/zahra.jpg",
    story: `
      <h3>Zahra Al-Mansoori – Yemen</h3>
      <img src="images/zahra.jpg" alt="Zahra" style="width:40%;border-radius:8px;">
      <p>Zahra bled to death at home because the family couldn’t afford transportation to a hospital 80 km away.</p>
      <p>Her sister was forced into early marriage due to economic hardship.</p>
      <img src="images/yemen_transport_gap.png" alt="Yemen Transportation Gap" style="width:100%;border-radius:8px;">
      <p>This chart helps contextualize Zahra Al-Mansoori's story—where lack of timely care and emergency access led to her preventable death. Only 9% of rural areas have reliable Transport Access to health facilities.

Just 11% have Emergency Obstetric Care, essential for saving mothers' lives.

Only 24% of births are attended by skilled professionals.

Only 17% of clinics operate 24/7.</p>

    `
  },
  {
    name: "Nyamal Deng",
    country: "South Sudan",
    region: "Sub-Saharan Africa",
    image: "images/nyamal.jpg",
    story: `
      <h3>Nyamal Deng – South Sudan</h3>
      <img src="images/nyamal.jpg" alt="Nymal" style="width:40%;border-radius:8px;">
      <p>Nyamal died from sepsis after giving birth in a refugee camp with no clean water or antibiotics.</p>
      <img src="images/southsudan_refugee_maternal.png" alt="Maternal Risk in Camps" style="width:100%;border-radius:8px;">
      <p>Her death led to two of her children being separated and placed with different relatives.</p>
      <img src="images/chart-placeholde5.png" alt="Maternal Mortality in Displacement Camps" style="width:100%;border-radius:8px;">
      <p>Here is the bar chart titled "Maternal Mortality in South Sudan Displacement Camps". It shows alarming mortality rates across camps:

Malakal: 1120 deaths per 100,000 live births

Bor: 1050

Bentiu: 990

Juba (UN House): 890

Wau: 870

These figures highlight the critical health gaps faced by women like Nyamal Deng.</p>
    `
  },
  {
    name: "María Luz Ortega",
    country: "Nicaragua",
    region: "Latin America & Caribbean",
    image: "images/maria.jpg",
    story: `
      <h3>María Luz Ortega – Nicaragua</h3>
      <img src="images/maria.jpg" alt="Maria" style="width:40%;border-radius:8px;">
      <p>María died from a ruptured uterus after multiple pregnancies with no access to family planning or emergency care.</p>
      <p>Her teenage son left school to become the sole earner.</p>
       <img src="images/nicaragua_fertility_chart.png" alt="Fertility and Care Gaps" style="width:100%;border-radius:8px;">
      <p>Here's the "Fertility and Maternal Care Gaps in Nicaragua" chart:

Regions like North Atlantic have high fertility (3.9) and a 60% maternal care gap, meaning many women lack skilled birth support.

In contrast, the Pacific region has both lower fertility (2.6) and better maternal care access.

This illustrates the risks faced by women like María Luz Ortega in underserved rural areas.</p>
       <img src="images/chart-placeholder6.png" alt="Unmet Need for Family Planning in Nicaragua" style="width:100%;border-radius:8px;">
      <p>This bar chart above displays the percentage of women of reproductive age in four major regions of Nicaragua who want to avoid or delay pregnancy but do not have access to modern contraceptives. This condition is called “unmet need for family planning.”</p>
    <h3>Unmet Need for Family Planning by Region</h3>

<table style="width: 100%; max-width: 700px; border-collapse: collapse; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
  <thead style="background-color: #f7f7f7;">
    <tr>
      <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Region</th>
      <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Unmet Need (%)</th>
      <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Implication</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #fff;">
      <td style="border: 1px solid #ddd; padding: 10px;">North Atlantic</td>
      <td style="border: 1px solid #ddd; padding: 10px;">31%</td>
      <td style="border: 1px solid #ddd; padding: 10px;">Highest unmet need. Poor access, rural isolation.</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="border: 1px solid #ddd; padding: 10px;">South Atlantic</td>
      <td style="border: 1px solid #ddd; padding: 10px;">28%</td>
      <td style="border: 1px solid #ddd; padding: 10px;">High unmet need due to poor infrastructure.</td>
    </tr>
    <tr style="background-color: #fff;">
      <td style="border: 1px solid #ddd; padding: 10px;">Central</td>
      <td style="border: 1px solid #ddd; padding: 10px;">22%</td>
      <td style="border: 1px solid #ddd; padding: 10px;">Moderate need; rural areas underserved.</td>
    </tr>
    <tr style="background-color: #f9f9f9;">
      <td style="border: 1px solid #ddd; padding: 10px;">Pacific</td>
      <td style="border: 1px solid #ddd; padding: 10px;">18%</td>
      <td style="border: 1px solid #ddd; padding: 10px;">Lowest need; better access in urban centers.</td>
    </tr>
  </tbody>
</table>
<div style="margin-top: 20px; padding: 15px; border-left: 4px solid #e74c3c; background-color: #fdf2f2; font-family: Arial, sans-serif;">
  <h3 style="color: #c0392b; font-size: 18px; margin-top: 0;">❗ Why This Matters (for María Luz Ortega’s story):</h3>
  <ul style="list-style-type: disc; padding-left: 20px; color: #333; font-size: 14px; margin: 0;">
    <li style="margin-bottom: 8px;">More likely to have unplanned pregnancies,</li>
    <li style="margin-bottom: 8px;">Less likely to have skilled birth attendants,</li>
    <li style="margin-bottom: 8px;">At higher risk of maternal death due to complications they couldn’t prevent or prepare for.</li>
  </ul>
</div>

      `
  }
];

// function drawScene4() {
//   d3.select(".viz-container").style("display", "none");
//   d3.select("#description").style("display", "none");

//   d3.select("#map").style("display", "none");
//   d3.select("#region-info").style("display", "none");


//   d3.select("#chart").style("display", "none");

//   d3.select("#country-detail").style("display", "none");




//   // d3.select("#map").style("display", "block");
//  d3.select("#map-wrapper")
//   .style("display", "none");

  


//   d3.selectAll('.scene').style('display', 'none');
//   d3.select('#scene4').style('display', 'block');

//   const grid = d3.select("#family-container");
//   grid.html(""); // Clear previous

//   families.forEach((fam, i) => {
//     const card = grid.append("div")
//       .attr("class", "family-card")
//       .on("click", () => showFamilyDetail(fam));

//     card.append("img").attr("src", fam.image);
//     card.append("p").text(fam.name);
//   });

//   // Close detail view
//   d3.select("#close-detail").on("click", () => {
//     d3.select("#family-detail").style("display", "none");
//     d3.select("#family-container").style("display", "flex");
//   });
// }

// function showFamilyDetail(family) {
//   d3.select("#family-detail").style("display", "block");
//   d3.select("#family-container").style("display", "none");
//   d3.select("#detail-content").html(family.story);
// }



// d3.select("#next").on("click", () => {
//   currentScene = (currentScene + 1) % 3;
//   updateScene();
// });
// d3.select("#next").on("click", () => {
//   currentScene = (currentScene + 1) % 4;  // Now cycles through 0,1,2,3
//   updateScene();
// });


// // d3.select("#prev").on("click", () => {
// //   currentScene = (currentScene - 1 + 3) % 3;
// //   updateScene();
// // });
// d3.select("#prev").on("click", () => {
//   currentScene = (currentScene - 1 + 4) % 4;  // Wraps correctly from 0 → 3
//   updateScene();
// });

function drawScene4() {
  // Hide everything else
    d3.select("#region-info").classed("visible", false).style("display", "none");

  d3.select("#region-legend").style("display", "none");
  d3.select("#scene3-wrapper").style("display", "none");


  d3.selectAll(".viz-container, #description, #map, #region-info, #chart, #country-detail, #map-wrapper")
    .style("display", "none");

  // Show Scene 4
  d3.selectAll('.scene').style('display', 'none');


  d3.select(".viz-container").style("display", "none");
  d3.select("#chart").style("display", "none");
  d3.select("#description").style("display", "none");
  d3.select("#scene3-wrapper").style("display", "none");
  d3.select("#region-info").style("display", "none");
  d3.select("#country-detail").style("display", "none");

  // ✅ Hide all story containers
  document.querySelectorAll('.story-container').forEach(el => {
    el.style.display = 'none';
  });
  d3.select('#scene4').style('display', 'block');

  // Clear and render cards
  const grid = d3.select("#family-container");
  grid.html("");

  // families.forEach((fam) => {
  //   const card = grid.append("div")
  //     .attr("class", "family-card")
  //     .on("click", () => showFamilyDetail(fam));

  //   card.append("img")
  //     .attr("src", fam.image)
  //     .attr("alt", fam.name);

  //   card.append("div")
  //     .attr("class", "name")
  //     .text(fam.name);
  // });

  // // Handle closing the detail view
  // d3.select("#close-detail").on("click", () => {
  //   d3.select("#family-detail").style("display", "none");
  //   d3.select("#family-container").style("display", "flex");
  // });
}

// function showFamilyDetail(family) {
//   d3.select("#family-detail").style("display", "block");
//   d3.select("#family-container").style("display", "none");
//   d3.select("#detail-content").html(family.story);
// }
d3.select("#next").on("click", () => {
  if (currentScene < 3) {
    currentScene++;
    updateScene();
  }
});

d3.select("#prev").on("click", () => {
  if (currentScene > 0) {
    currentScene--;
    updateScene();
  }
});
document.querySelectorAll('.family-card').forEach(card => {
  card.addEventListener('click', () => {
    const storyId = card.getAttribute('data-story-id');
    document.querySelectorAll('.story-container').forEach(s => s.style.display = 'none');
    const target = document.getElementById(storyId);
    if (target) {
      target.style.display = 'block';
      window.scrollTo({ top: target.offsetTop - 20, behavior: 'smooth' });
    }
  });
});
