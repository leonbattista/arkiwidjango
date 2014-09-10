app.filter('datetime', function($filter)
{
 return function(input)
 {
  if(input == null){ return ""; } 
 
  var formattedDate = $filter('date')(new Date(input),
                              'MMM. d, yyyy - HH:mm');
 
  return formattedDate;

 };
});