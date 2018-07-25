$(function () {
	
	$("#queryPerson").click(function(){
		$.get("/sys/hluser/getAllUserMap?userName="+$("#userName").val(), function(json){
			initTree(json);
		});
	});

	var margin = {
		top : 0,
		right : 120,
		bottom : 30,
		left : 120
	}, width = 2400 - margin.right - margin.left, height = 800 - margin.top
			- margin.bottom;

	var i = 0, duration = 750, root;

	var tree = d3.layout.tree().size([ height, width ]);

	var diagonal = d3.svg.diagonal().projection(function(d) {
		return [ d.y, d.x ];
	});

	var svg = d3.select("#main-content").append("svg").attr("width",
			width).attr("height",
			height).append("g").attr("transform",
			"translate(" + 100 + "," + margin.top + ")");


	$.get("/sys/hluser/getAllUserMap?userName=", function(json){
		initTree(json);
	});
	
	function initTree(json){
		root = json.nodes;
		root.x0 = 0;
		root.y0 = 0;
		
		vm.achievement = json.nodes.achievement;

		function collapse(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
			//	d.children = null;
			}
		}
		root.children.forEach(collapse);
		update(root);
	}
	

	d3.select(self.frameElement).style("height", "700px");

	function update(source) {

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse(), links = tree.links(nodes);

		// Normalize for fixed-depth.
		nodes.forEach(function(d) {
			d.y = d.depth * 100;
		});

		// Update the nodes…
		var node = svg.selectAll("g.node").data(nodes, function(d) {
			return d.id || (d.id = ++i);
		});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("g").attr("class", "node").attr(
				"transform", function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				}).on("click", click);

		nodeEnter.append("circle").attr("r", 1e-6).style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

		nodeEnter.append("text").attr("x", function(d) {
			return d.children || d._children ? -5 : 5;
		}).attr("dy", ".35em").attr("text-anchor", function(d) {
			return d.children || d._children ? "end" : "start";
		}).text(function(d) {
			return d.userNode.userName + "|" + d.userNode.name;
		}).style("fill-opacity", 1e-6);

		// Transition nodes to their new position.
		var nodeUpdate = node.transition().duration(duration).attr("transform",
				function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

		nodeUpdate.select("circle").attr("r", 4.5).style("fill", function(d) {
			return d._children ? "lightsteelblue" : "#fff";
		});

		nodeUpdate.select("text").style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition().duration(duration).attr(
				"transform", function(d) {
					return "translate(" + source.y + "," + source.x + ")";
				}).remove();

		nodeExit.select("circle").attr("r", 1e-6);

		nodeExit.select("text").style("fill-opacity", 1e-6);

		// Update the links…
		var link = svg.selectAll("path.link").data(links, function(d) {
			return d.target.id;
		});

		// Enter any new links at the parent's previous position.
		link.enter().insert("path", "g").attr("class", "link").attr("d",
				function(d) {
					var o = {
						x : source.x0,
						y : source.y0
					};
					return diagonal({
						source : o,
						target : o
					});
				});

		// Transition links to their new position.
		link.transition().duration(duration).attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition().duration(duration).attr("d", function(d) {
			var o = {
				x : source.x,
				y : source.y
			};
			return diagonal({
				source : o,
				target : o
			});
		}).remove();

		// Stash the old positions for transition.
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

	// Toggle children on click.
	function click(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
		update(d);
	}

});

var vm = new Vue({
	el:'#rrapp',
	data:{
		showList: true,
		title: null,
		achievement: {
		},
		recLink: null,
		imgUrl: null
	}
});
