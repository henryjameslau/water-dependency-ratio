  function main() {
  		var statistic = "age"

		var svg = d3.select("#viz")
    					.append("svg");
    	var gaxis  = svg.append("g")
      					.attr("class", "x axis")
      					.attr("transform", "translate(0," + 25 + ")")
      	//initial draw
        var width = $("#viz").width();
        svg.attr("width", width).attr("height", 150);

        var dataconfig = [
				{
					stat: "age",
					title: "Water Dependency Ratio",
					units: "%",
					perc: false,
					thousands: false
				}
			];

        d3.csv("./water2.csv", function(error, data) {

	    	data.forEach(function(d) {
				d.age = +d.age;
			});

			function selectstat(stat) {
    			return function(object) {
        			return object.stat == stat;
    			}
			}

			var statconfig = dataconfig.filter(selectstat(statistic))[0];

			var dataset = data.map(function(obj) {
				var rObj = {};
				rObj.NL = obj.NL;
				rObj.NIS = obj.NIS;
				rObj.Reg_NL = obj.Reg_NL;
				rObj.value = obj[statistic];
				if (statconfig.perc) {
					rObj.value = obj[statistic]*100;
				}
				return rObj;
			});
			data = dataset;

  			var municip = data.map(function(el) {
  				var mun = el.NL;
  				return mun;
  			});

			function lookupNIS(NIScode) {
    			return function(object) {
        			return object.NIS == NIScode;
    			}
			}
			function lookupname(gemeentenaam) {
				return function(object) {
					return object.NL == gemeentenaam;
				}
			}

			d3.select("#title").text(statconfig.title);
			d3.select("#units").text(statconfig.units);

			//Scale the range of the data
    		var x = d3.scale.linear().range([5,width-5]);
	  		x.domain(d3.extent(data, function(d) {return d.value; }));
    		
    		var xAxis = d3.svg.axis().scale(x);
    		if (statconfig.thousands) {
    			xAxis = d3.svg.axis().scale(x).tickFormat(d3.format("s"));
    		}
    		gaxis.call(xAxis);

			var lines  = svg.selectAll("line.municipline")
				.data(data)
				.enter()
				.append("line")
				.attr("class", "municipline")
				.attr("id", function(d) {return "nis" + d.NIS ;})
				.attr("x1", function(d,i) { return x(d.value) ; })
        		.attr("x2", function(d) { return x(d.value) ; })
        		.attr("y1", 50)
        		.attr("y2", 150)
        		.style("stroke", function(d) {return "#2c3b78";})
        		.style("stroke-width", 2)
        		.style("opacity", function(d){return 0.1;})
        		.on("mouseover", function(d) {
        			d3.selectAll("line.municipline").transition().duration(100)
        				.attr("y1",50)
        				.style("stroke-width", 2)
        				.style("opacity", function(d) {return 0.1;});
        			d3.select(this)
        				.transition().duration(100)
        				.attr("y1",0)
        				.style("stroke-width", 3)
        				.style("opacity", 1);
        			if (x(d.value) > width/2) {
        				tooltip.attr("text-anchor", "end")
        			}
        			else {
						tooltip.attr("text-anchor", "start")
        			}	
            		tooltip.transition().duration(100)
            			.style("opacity", 1)
            			.text(function() {
            				if(statconfig.thousands) {
            					return d.NL + " "  + Math.round(d.value) + " " + statconfig.units;
            				}
            				else {
            					return d.NL + " "  + Math.round(d.value*10)/10 + " " + statconfig.units;
            				}
            			})
            			.style("fill", function() {return "#2c3b78";})
                		.attr("x",  function() {
                			if (x(d.value) > width/2) {
                				return x(d.value) - 5;
                			}
                			else {
                				return x(d.value) + 5;
                			}
                		})
            	})
        		.on("mouseout", function(d) {		
            		d3.select(this)
            			.transition().delay(200)
            			.attr("y1",50)
            			.style("stroke-width", 2)
            			.style("opacity", function(d) {return 0.1;});
            		tooltip.transition().delay(100).style("opacity", 0);
        		});


        	
        	// Tooltip
			var tooltip = svg.append("text")	
			    .attr("class", "ttip")
			    .attr("y", 20)
			    .attr("x", function() {
                			if (x(data.filter(lookupNIS(31022))[0].value) > width/2) {
                				return x(data.filter(lookupNIS(31022))[0].value) - 5;
                			}
                			else {
                				return x(data.filter(lookupNIS(31022))[0].value) + 5;
                			}
                		})
			    .attr("text-anchor", function() {
                			if (x(data.filter(lookupNIS(31022))[0].value) > width/2) {
                				return "end";
                			}
                			else {
                				return "start";
                			}
                		})
			    .style("font-size", "18px")
			    .style("fill", "#9a0b16")			
			    .style("opacity", 1)
			    .text(function() {
            				if(statconfig.thousands) {
            					return data.filter(lookupNIS(31022))[0].NL + " "  + Math.round(data.filter(lookupNIS(31022))[0].value) + " " + statconfig.units;
            				}
            				else {
            					return data.filter(lookupNIS(31022))[0].NL + " "  + Math.round(data.filter(lookupNIS(31022))[0].value*10)/10 + " " + statconfig.units;
            				}
            			});


			  //AUTOCOMPLETE
			  var substringMatcher = function(strs) {
				  return function findMatches(q, cb) {
				    var matches, substringRegex;

				    // an array that will be populated with substring matches
				    matches = [];

				    // regex used to determine if a string contains the substring `q`
				    substrRegex = new RegExp(q, 'i');

				    // iterate through the pool of strings and for any string that
				    // contains the substring `q`, add it to the `matches` array
				    $.each(strs, function(i, str) {
				      if (substrRegex.test(str)) {
				        matches.push(str);
				      }
				    });

				    cb(matches);
				  };
				};

				$('#typeaheadcontainer .typeahead').typeahead({
				  hint: true,
				  highlight: true,
				  minLength: 2,
				  autoselect: true
				},
				{
				  name: 'municip',
				  source: substringMatcher(municip),
                  limit: 6
				})
				.on('typeahead:select', function(object, datum) {
					var NISsel = "line#nis" + data.filter(lookupname(datum))[0].NIS;
					var name = datum;
					var value = data.filter(lookupname(datum))[0].value;
					var region = data.filter(lookupname(datum))[0].Reg_NL;

					d3.selectAll("line.municipline")
        				.attr("y1",50)
        				.style("stroke-width", 2)
        				.style("opacity", function(d) {return 0.1;});
        			d3.select(NISsel)
        				.transition().duration(100)
        				.attr("y1",0)
        				.style("stroke-width", 3)
        				.style("opacity", 1);
        			if (x(value) > width/2) {
        				tooltip.attr("text-anchor", "end")
        			}
        			else {
						tooltip.attr("text-anchor", "start")
        			}	
            		tooltip.transition().duration(100)
            			.style("opacity", 1)
            			.text(function() {
            				if(statconfig.thousands) {
            					return name + " "  + Math.round(value) + " " + statconfig.units;
            				}
            				else {
            					return name + " "  + Math.round(value*10)/10 + " " + statconfig.units;
            				}
            			})
            			.style("fill", function() {return "#2c3b78";})
                		.attr("x",  function() {
                			if (x(value) > width/2) {
                				return x(value) - 5;
                			}
                			else {
                				return x(value) + 5;
                			}
                		});


				});
  				//Use enter key to select first typeahead suggestion
  				$('#typeaheadcontainer').on('keyup', function(e) {
				    if(e.which == 13) {
				        $(".tt-suggestion:first-child", this).trigger('click');
				    }
				});

			//For resizing, optionally
			/*function redraw() {
				var width = $("#viz").width();
        		svg.attr("width", width);

				x = d3.scale.linear().range([5,width-5]);
    			x.domain(d3.extent(data, function(d) {return d.Unemployed*100; }));
    		
    			var xAxis = d3.svg.axis().scale(x);
    			gaxis.call(xAxis);

        		svg.selectAll(".municipline")
        			.attr("x1", function(d) { return x(d.Unemployed*100) ; })
        			.attr("x2", function(d) { return x(d.Unemployed*100) ; })
        			.on("mouseover", function(d) {
        			d3.select(this).style("stroke", "#c75845").style("opacity", 1);
        			if (x(d.Unemployed*100) > width/2) {
        				tooltip.attr("text-anchor", "end")
        			}
        			else {
						tooltip.attr("text-anchor", "start")
        			}	
            		tooltip.style("opacity", .9)
            			.text(d.NL + " "  + Math.round(d.Unemployed*1000)/10 + " €/inwoner/jaar")	
                		.attr("x",  x(d.Unemployed*100))
            	})
        		.on("mouseout", function(d) {		
            		d3.select(this).style("stroke", "2c3b78").style("opacity", 0.3);
            		tooltip.style("opacity", 0);	
        		});
	    	};
	    	window.addEventListener("resize", redraw);*/
		});
	 }
		
      window.onload = main;