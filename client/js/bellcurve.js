(function($) {

   $(document).ready(function() {
      console.log('document bellcurver');
      
      $('button#submit').click(function() {
          console.log('submitting');
          var effortId = $('input#effortId').val();
          $(location).attr('href', '/bellcurve/effort/' + effortId);
      });
   });
   
})(jQuery);;