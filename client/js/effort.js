(function($) {

   $(document).ready(function() {
      var data = [{ x: effort.matchedEffortsTimes, type: 'histogram', marker: { color: 'rgba(100,250,100,0.7)', }, } ]; 
      Plotly.newPlot('plotly', data);
   });
   
})(jQuery);;