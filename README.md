# Bar Chart Webpage
### The idea of this project was that if, say, a store manager wanted to view how products of a certain category were selling over a given time period, they could do so using this app. They can enter which categories they want to view as well as a start/end date, and the produced stacked bar chart would allow them to visualize that.

d3server.js contains the code for the web server.  
data.js contains retrieveData() and formatData(), which are used to process SQL data for display.  
display.js contains the D3 code for displaying the bar chart.  
d3withsql.html contains the HTML code for the form/time inputs.  
