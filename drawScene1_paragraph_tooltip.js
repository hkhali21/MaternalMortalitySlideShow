
function drawScene1() {
  // Clear previous text now
  d3.select("#description").html(`
    <h2>Scene 1: Maternal Mortality vs. Income Group</h2>
    <p>
      This bubble chart shows the relationship between income group and maternal mortality ratio (MMR) across countries.
      Each bubble represents a country, with the size indicating the number of live births. 
      The color highlights specific countries: <span style='color:crimson;font-weight:bold;'>Nigeria</span> and 
      <span style='color:green;font-weight:bold;'>Norway</span>. 
      Hover over these bubbles to explore their statistics. As expected, lower-income countries tend to have higher MMR.
    </p>
  `);

  const xScale = d3.scalePoint()
    .domain(["Low income", "Lower middle income", "Upper middle income", "High income"])
    .range([100, width - 100]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mmr)]).nice()
    .range([height - 50, 50]);

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "6px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("box-shadow", "0 0 5px rgba(0,0,0,0.2)")
    .style("pointer-events", "none")
    .style("opacity", 0);

  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d.income))
    .attr("cy", height - 50)
    .attr("r", d => Math.sqrt(d.births) / 200)
    .attr("fill", d => {
      if (d.country === "Nigeria") return "crimson";
      if (d.country === "Norway") return "green";
      return "#8888ff";
    })
    .attr("opacity", 0.7)
    .on("mouseover", function (event, d) {
      if (["Nigeria", "Norway"].includes(d.country)) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.country}</strong><br>Income: ${d.income}<br>MMR: ${d.mmr}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function () {
      tooltip.transition().duration(300).style("opacity", 0);
    })
    .transition()
    .duration(2500)
    .attr("cy", d => yScale(d.mmr));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Income Group");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text("Maternal Mortality Ratio");

  xScale.domain().forEach((group, i) => {
    svg.append("text")
      .attr("x", xScale(group))
      .attr("y", height - 55)
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
    { label: "Other Countries", color: "#8888ff" },
    { label: "Nigeria", color: "crimson" },
    { label: "Norway", color: "green" }
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
}
