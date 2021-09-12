import React, { Component } from "react";
import PropTypes from "prop-types";

import "./styles.css";
const close = require("../../assets/x.svg");

export default class Comments extends Component {
	constructor(props) {
		super(props);

		this.selected = false;
		this.showNewComment = this.showNewComment.bind(this);
	}

	showNewComment(evt) {
		this.selected = true;
		this.props.handleNewComment(evt);
	}

	dateFormat(string) {
		const [year, month, day] = string.slice(0, 10).split("-");
		return `${day}/${month}/${year}`;
	}

	handleLike(evt) {
		const id = evt.target.getAttribute("data-id");
		this.props.likeFunction(parseInt(id));
	}	
	
	handleReport(evt) {
		const id = evt.target.getAttribute("data-id");
		this.props.reportFunction(parseInt(id));
	}

	handleChat(evt) {
		const comment_reference = evt.target.getAttribute("data-reference");
		const comment_id = parseInt(evt.target.getAttribute("data-id"));
		const comment_text = evt.target.getAttribute("data-text");

		this.props.goToDiscussion(comment_id, 
			comment_text, comment_reference);
	}

	render() {
		return (
			<div className="side">
				<div className="top">
					<h2 style={{ alignSelf: "center" }}> Comentários </h2>
					<button onClick={this.props.closeFunction}>
						<img src={close} alt="Fechar" />
					</button>
				</div>

				<ul className="commentaries">
					{this.props.commentaries.length !== 0 ? (
						this.props.commentaries.map((commentary) => (
							<li key={commentary.id}>
								<h3 style={{ display: "flex" }}>
									{commentary.username}
									{commentary.tags.map((tag) => (
										<img
											key={tag} alt={tag}
											src={this.props.imageFunction(tag)}
											style={{ height: "1rem", margin: "0 4px" }}
										/>
									))}
									<sub>{this.dateFormat(commentary.created_at)}</sub>
								</h3>
								<label style={{ display: "flex" }} htmlFor={commentary.id}>
									<p className="label-title">{commentary.text}</p>
								</label>
								<input type="checkbox" id={commentary.id} />
								<div className="user-comment">
									<p>{commentary.text}</p>
									<span className="comment-buttons">
										<p>
											{" "}
											Favoritado por{" "}
											<b>{JSON.parse(commentary.likes).length}</b> pessoas{" "}
										</p>
										<button
											onClick={this.handleLike}
											data-id = {commentary.id}
										>
											<img src={this.props.imageFunction("heart")} alt="like" />
										</button>
										<button
											onClick={this.handleChat}
											data-id = {commentary.id}
											data-text = {commentary.verse}
											data-reference = {commentary.book_reference}
										>
											<img src={this.props.imageFunction("chat")} alt="chat" />
										</button>
										<button
											data-id = {commentary.id}
											onClick={this.handleReport}
										>
											<img
												src={this.props.imageFunction("warning")}
												alt="report"
											/>
										</button>
									</span>
								</div>
							</li>
						)) // Ternary operator
					) : (
						<li>
							<h3> Nenhum comentário </h3>
							<p> Seja o primeiro a comentar </p>
						</li>
					)}
				</ul>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
					}}
				>
					<button className="entry" onClick={this.showNewComment}>
						Comentar
					</button>
				</div>
			</div>
		);
	}
}

Comments.propTypes = {
	handleNewComment: PropTypes.func.isRequired,
	closeFunction: PropTypes.func.isRequired,
	commentaries: PropTypes.array.isRequired,
	imageFunction: PropTypes.func.isRequired,
	likeFunction: PropTypes.func.isRequired,
	goToDiscussion: PropTypes.func.isRequired,
	reportFunction: PropTypes.func.isRequired,
};
