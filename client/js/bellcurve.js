(function($) {
   
   //simple for now, add react later maybe
   var plotTimes = function(times) {
      var plot = [{
         x: times,
         type: 'histogram',
         marker: {
            color: 'rgba(100,250,100,0.7)',
         },
      }];
      var layout = {
         xaxis: {
            autorange: 'reversed'
         },
         bargap: 0.05
      };
      Plotly.newPlot('plotly', plot, layout);
   };
   
   //draw stats texts
   var summarize = function(data) {
      $('#statsTable').css('display', 'block');
      $('#athleteId').html(data.matchedEffort.athlete.id);
      $('#name').html(data.matchedEffort.name);
      var niceTime = moment("2015-01-01").startOf('day')
         .seconds(data.matchedEffort.elapsed_time)
         .format('H:mm:ss');
      $('#niceTime').html(niceTime + ' (' + data.matchedEffort.elapsed_time + 's)' );
      $('#start_date_local').html(data.matchedEffort.start_date_local);
      $('#matchedEffortsListLength').html(data.matchedEffortsListLength);
   };
   
   $(document).ready(function() {
      $('button#submit').focus();
      $('#statsTable').css('display', 'none');
      $('#loading').css('display', 'none');
      $('button#submit').click(function() {
         $('#loading').css('display', 'block');
         var effortId = $('#effortId').val();
         var effortUrl = '/bellcurve/effort/' + effortId;
         $.ajax({
            url: effortUrl,
            type: "GET",
            success: function(data) {
               plotTimes(data.matchedEffortsTimes);
               summarize(data);
               $('#loading').css('display', 'none');
            },
            fail: function(jqXHR, textStatus) {
               console.log(jqXHR);
               alert("error: " + textStatus);
            }
         });
      });
   }); //endDocumentReadyFunction
   
})(jQuery); //endIIFE