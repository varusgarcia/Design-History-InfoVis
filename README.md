# Design History Information Visualization

This project was created in the winter semester 2015/16 at the [FH Potsdam](http://www.fh-potsdam.de) during the seminar _Designer/-innen-Geschichte_ supervised by Philip Zerweck.

The students researched vita and social connections from people, wich were roughly active between 1930 and 1980, connected to the german society and had their field of activity in product design (incl. fashion, porcelain, furniture, etc.) or graphic design (incl. photo, movie, etc.). This visualization is created based on this database. The goal is to show the designer history as a social network.

~~**Project website: [designgeschichte.fh-potsdam.de](http://designgeschichte.fh-potsdam.de)**~~

> [!IMPORTANT]  
> This project isn't maintained and unfortunately not acessible anymore. Head over to the [Incom project](https://fhp.incom.org/project/7443) to see some screenshots and read more.

## Design and Development

- [Philip Zerweck](http://www.heikoundphilippa.de)
- [Alexander Käßner](http://www.alexkaessner.de/)
- [Julian Scheidsteger](https://github.com/natael)
- [Valentin Dragomirescu](http://dragomarts.de/)
- [Alvaro Garcia](http://agweiss.com/)
- [Daniel Martin](https://www.instagram.com/clementcopper)

## Navigation
- _Zoom:_ use the scroll wheel or touchpad
- _Move:_ click inside the graphic and move the cursor
- _Designer Information:_ click on a node
- _Connection Information:_ hover a edge or node
- _Connection Source:_ click on a edge

The designers are horizontally sorted by birthdate. The bigger the nodes, the more connections a designer have.  
The thickness of the connection lines (edges) indicates the strength of the connection. The thicker the line, the stronger is the connection. For example family members are a strong connection, commilitons are a weaker connection.

## Contribution
The content of the database can be expanded and improved anytime. For additions, corrections and remarks please send a mail to [zerweck@heikoundphilippa.de](mailto:zerweck@heikoundphilippa.de).

For technical problems or hints please create a new [issue](https://github.com/varusgarcia/Design-History-InfoVis/issues).

## Code Structure
The main code of the visualization is executed by the `app.js` using [d3.js](https://d3js.org) v3.5.16 (included in the repo) and loaded into the `index.html`. We're using our own [backend](http://designgeschichte.fh-potsdam.de/backend/dashboard) to provide the data for the nodes and edges using 3 JSON files.
