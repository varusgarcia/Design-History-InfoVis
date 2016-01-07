d3.json("https://raw.githubusercontent.com/varusgarcia/Design-History-InfoVis/master/test-db/data.json", function (data){

  var browserHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  var startDate = 1850;
  var xScale = 30;

  var canvas = d3.select("body")
                .append("svg")
                .attr("id", "chartSVG")
                .attr("width", 5000)
                .attr("height", browserHeight)

  // Define the data for the node groups
  var nodeElements = canvas.selectAll("node")
                .data(data) // binds data to circles

  // Create and place the "blocks" containing the circle and the text
  var nodeBlock = nodeElements.enter()
                .append("g")
                .attr("id", function (d){ return d.ID})
                .attr("transform", function(d) { return "translate("+((d.Geboren * xScale) - (startDate * xScale))+","+(Math.random() * (browserHeight-40 - 30) + 30)+")";})

  // CIRLCES
  var circles = nodeBlock.append("circle")
                .attr("r", 50)
                .attr("fill", "#00729c")

  // TEXT LABELS
  var labels = nodeBlock.append("text")
                .attr("dy", function(d){ return 30 })
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .text(function(d){ return d.Name })

  d3.json("https://raw.githubusercontent.com/varusgarcia/Design-History-InfoVis/master/test-db/connection.json", function (connection){

    // draw lines between nodes based on connection ID's
    var line = canvas.selectAll("line")
                .data(connection)
                .enter()
                .insert("line", ":first-child")
                  .attr("x1", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID1)
                    var currentX = d3.transform(g.attr("transform")).translate[0]
                    return currentX
                  })
                  .attr("y1", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID1)
                    var currentY = d3.transform(g.attr("transform")).translate[1]
                    return currentY
                  })
                  .attr("x2", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID2)
                    var currentX = d3.transform(g.attr("transform")).translate[0]
                    return currentX
                  })
                  .attr("y2", function (d){
                    var g = d3.select("svg").selectAll("#"+d.ID2)
                    var currentY = d3.transform(g.attr("transform")).translate[1]
                    return currentY
                  })
                  .attr("stroke", "white")
                  .attr("stroke-width", function (d){ return d.Quality*2 })
                  .style("opacity", "0.2")
                  .on("mouseover", function(){ d3.select(this).style("opacity", "1")})
                  .on("mouseout", function(){ d3.select(this).style("opacity", "0.2")});
  })

  d3.selectAll("g")
      .on("mouseover", function(){
        // move to front
        this.parentNode.appendChild(this);
      });

  /*
  // Returns an event handler for fading a given chord group.
  function fade(opacity) {
  return function(g, i) {
    d3.selectAll("line")
        .filter(function(d) { return d.source != i && d.target != i})
      .transition()
        .style("opacity", opacity);
  }};*/
});
