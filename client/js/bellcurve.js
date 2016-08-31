(function($) {
   $(document).ready(function() {
      $('button#submit').focus();
      $('button#submit').click(function() {
         var effortId = $('#effortId').val();
         var effortUrl = '/bellcurve/effort/' + effortId;
         $.ajax({
            url: effortUrl,
            type: "GET",
            success: function(data) {
               console.log(data);
               var plot = [{
                  x: data.matchedEffortsTimes,
                  type: 'histogram',
                  marker: {
                     color: 'rgba(100,250,100,0.7)',
                  },
               }];
               var layout = {xaxis: {autorange: 'reversed'}};
               Plotly.newPlot('plotly', plot, layout);
               
               $('#debug').append(data.matchedEffort.name);
               $('#debug').append('<br /><br /><br />');
               $('#debug').append('Your Time Was ' + data.matchedEffort.elapsed_time);
               $('#debug').append('<br /><br /><br />');
            },
            fail: function(jqXHR, textStatus) {
               console.log(jqXHR);
               alert("error: " + textStatus);
            }
         });

      });

   }); //endDocumentReadyFunction
})(jQuery); //endIIFE