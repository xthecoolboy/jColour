var React = require('react');
var ReactDOM = require('react-dom');
var tinycolor = require("tinycolor2");


/* 

	MAIN APP
	
*/ 

class App extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = { display: false };
		this.toggleDisplay = this.toggleDisplay.bind(this);
		this.updateColour = this.updateColour.bind(this);
	}

	toggleDisplay() {
		const newDisplay = this.state.display == true ? false : true;
		this.setState({ display: newDisplay });
		console.log(this.state.display)
	}
	
	updateColour(newName, newColour) {
		this.setState({colourModal: [
			newName,
			newColour
		]})
	}
	
	render() {
		
		return (
			<div className="is-page">
				<Modal display={this.state.display} colourModal={this.state.colourModal} toggleDisplay={this.toggleDisplay}/>
				<section className="hero header is-black is-small">
					<div className="hero-body">
						<div className="container">

							<h1 className="title is-1">jColour Options</h1>

						</div>
					</div>
				</section>


				<section className="hero colours">
					<a name="colours"></a>

					<h1 className="title">Here are the available colours.</h1>
					<h2 className="subtitle">Use j!colour [colour name] <br/>
					Get a random one with j!colour random <br/>
					Click a colour to see a Discord chat preview.</h2>

					<div className="container ">
						<div className="columns is-multiline is-inline-flex-touch">
							<Colours colours={this.props.colours} updateColour={this.updateColour} toggleDisplay={this.toggleDisplay}/>
						</div>
					</div>
				</section>
			</div>
		)
	}
}

/*

	ALL THE COLOURS IN ONE CLASS
	
*/


class Colours extends React.Component {
	render() {
		const object = this.props.colours; // The colour object
		return Object.keys(object).map(function(key) { // Iterates through the object
			return <Colour key={key} name={key} colour={object[key]} updateColour={this.props.updateColour} toggleDisplay={this.props.toggleDisplay} />
		}, this) // For every key, renders the Colour class with set values
	}
};

/*

	CLASS WITH ONE COLOUR
	
*/


class Colour extends React.Component { // Class which renders one colour
	
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	
	handleClick(e) {
		e.preventDefault();
		this.props.updateColour(this.props.name, this.props.colour);
		this.props.toggleDisplay()
	}
	
	render() {
		const name = this.props.name; // Let's set some variables to help us later.
		const colour = this.props.colour;
		let textColour = "#fff";
		
		if (tinycolor(colour).isLight()) {
			textColour = "#000";
		};
		
		return ( // Returns the thing for that colour

			<a onClick={this.handleClick} className="card is-colour" style={{ background: colour }}>
				<div className="card-content">
					<h2 className="title style-colour" style={{ color: textColour }}>{name}</h2>
				</div>
			</a>
		)
	}	
};


/*

	MODAL: SHOWS PREVIEW OF A COLOUR
	
*/

class Modal extends React.Component {
	render() {
		
		if (this.props.display) {
			
			const name = this.props.colourModal[0];
			const colour = this.props.colourModal[1];
			
			return (
				<div className="modal is-active">
					<div onClick={this.props.toggleDisplay} className="modal-background"></div>
					<div className="modal-content">
						<h1 className="title">Colour previews.</h1>
						<div className="card discord">
							<div className="card-content">
								<div className="media">
									<div className="media-left">
										<figure className="image is-64x64">
											<img src="assets/discord.png" alt="Picture" />
										</figure>
									</div>
									<div className="media-content">
										<p className="name" style={{ color: colour }}>Light mode</p>
										<p className="date">Today at 6.00 PM</p>	

										<p className="text">Testing the {name} colour.</p>
									</div> 
								</div>
							</div>
						</div>

						<div style={{ background: "#36393E" }} className="card discord discord-dark">
							<div className="card-content">
								<div className="media">
									<div className="media-left">
										<figure className="image is-64x64">
											<img src="assets/discord.png" alt="Picture" />
										</figure>
									</div>
									<div className="media-content">
										<p className="name" style={{ color: colour }}>Dark mode</p>
										<p className="date">Today at 6.00 PM</p>	

										<p className="text">Testing the {name} colour.</p>
									</div> 
								</div>
							</div>
						</div>
					</div>
					<button onClick={this.props.toggleDisplay} className="modal-close is-large" aria-label="close"></button>
				</div>
			)			
		} else {
			return (
				<div></div>
			)
		}


	}
}


const colours = { // Debug test values
	"lol": "#696969",
	"xd": "#aaaaaa",
	"foo": "green",
	"bar": "yellow",
	"lime": "#c8f96b",
	"neat": "#53e0aa",
	"SUPREME": "red",
	"me irl": "#ffffff",
	"pink": "pink",
	"chill purple": "#9d84f9",
	"pumpkin": "#ed9e28",
	"magenta": "#db36a7",
	"black": "#000000"
	
	
}


ReactDOM.render( // Renders the Colours class with the colours prop set to debug values
	<App colours={colours}/>,
	document.getElementById("app") // HTML element by the id of app
);