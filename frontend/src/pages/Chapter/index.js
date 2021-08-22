import React, { Component, createRef } from "react";
import axios from "../../services/api";
import PropTypes from "prop-types";

import { NotificationContext } from "../../contexts/NotificationContext";
import { isAuthenticated, TOKEN_KEY } from "../../services/auth";
import TitleComment from "../../components/TitleComments";
import NewComment from "../../components/NewComment";
import { Loading } from "../../components/Partials";
import Comments from "../../components/Comments";
import NavBar from "../../components/NavBar";

import "./styles.css";

const chat = require("../../assets/chat.svg");
const heart = require("../../assets/heart.svg");
const warning = require("../../assets/warning.svg");
const person = require("../../assets/person.svg");
const book = require("../../assets/book.svg");
const hand = require("../../assets/hand.svg");
const pen = require("../../assets/pen.svg");

export default class Chapter extends Component {
	static contextType = NotificationContext;

	constructor(props) {
		super(props);

		this.state = {
			newBoxClass: "invisible",
			asideClass: "invisible",
			mainClass: "main text",
			navClass: "visible",
			blur: "none",

			titleName: "Chapter",
			chapterNumber: "0",

			verses: [],
			comments: [],
			allComments: [],
			titleComments: [],
			currentVerse: { linha: null, verse: 0 },
		};

		// to parent access children's state
		this.titleComponent = createRef();
		this.commentsComponent = createRef();

		// to use the state of parent in the children
		this.getVerse = this.getVerse.bind(this);
		this.loadChapter = this.loadChapter.bind(this);
		this.goToDiscussion = this.goToDiscussion.bind(this);
		this.handleNewComment = this.handleNewComment.bind(this);

		this.handleLike = this.handleLike.bind(this);
		this.handleReport = this.handleReport.bind(this);

		this.closeComments = this.closeComments.bind(this);
		this.closeNewCommentary = this.closeNewCommentary.bind(this);

		this.addNewComment = this.addNewComment.bind(this);
	}

	componentDidMount() {
		const { abbrev, number } = this.props.match.params;
		const { handleNotification } = this.context;

		this.loadChapter(abbrev, number);
		this.handleNotification = handleNotification;
	}

	getVerse() {
		return this.state.currentVerse.verse;
	}

	loadChapter(abbrev, number) {
		this.abbrev = abbrev;
		this.number = number;

		try {
			axios.get(`books/${abbrev}/chapters/${number}`).then((response) => {
				if (typeof response.data.title !== "undefined") {
					const { title, verses } = response.data;
					this.setState({ titleName: title });
					this.setState({ verses: JSON.parse(verses) });
				}
			});
		} catch (err) {
			this.handleNotification("error",
				"Não consegui me conectar com o servidor"
			);
		}

		try {
			axios
				.get(`books/${abbrev}/chapters/${number}/comments`)
				.then((response) => {
					if (typeof response.data === "object") {
						const result = response.data.map((comment) => {
							comment.tags = JSON.parse(comment.tags);
							return comment;
						});
						const titleComments = [];
						const comments = [];
						for (const comment of result) {
							if (comment.on_title) {
								titleComments.push(comment);
							} else {
								comments.push(comment);
							}
						}

						this.setState({ allComments: comments });
						this.setState({ titleComments: titleComments });
					}
				});
		} catch (err) {
			this.handleNotification("error",
				"Não consegui me conectar com o servidor"
			);
		}

		if (number.length === 1) {
			number = "0" + number;
		}
		this.setState({ chapterNumber: number });
		return true;
	}

	handleComments(evt, verse) {
		evt.preventDefault();
		const linha = evt.target;

		if (
			this.state.currentVerse.linha !== null &&
			this.state.currentVerse.verse === verse
		) {
			this.closeComments(evt);
		} else {
			this.setState({
				asideClass: "visible",
				mainClass: "main comment",
				navClass: this.state.navClass.includes("navHide")
					? this.state.navClass
					: this.state.navClass + " navHide",
			});
			if (this.state.currentVerse.linha !== null) {
				var antigo = this.state.currentVerse;
				antigo.linha.style.backgroundColor = "white";
				this.setState({
					currentVerse: {
						linha: antigo.linha,
						verse: antigo.verse,
					},
				});
			}

			linha.style.backgroundColor = "yellow";
			this.setState({ currentVerse: { verse, linha } });

			const thisComments = this.state.allComments.filter((comment) => {
				return comment.verse === verse + 1;
			});
			if (thisComments.length > 0) {
				this.setState({ comments: thisComments });
			} else {
				this.setState({ comments: [] });
			}
		}
	}

	closeComments(evt) {
		evt.preventDefault();
		const linha = this.state.currentVerse.linha;
		linha.style.backgroundColor = "white";

		this.setState({
			currentVerse: { linha: null, verse: 0 },
			comments: [],
			asideClass: "invisible",
			mainClass: "main text",
			navClass: "visible",
		});
	}

	handleNewComment(evt) {
		evt.preventDefault();

		this.setState({
			newBoxClass: "visible centro",
			blur: "block",
			navClass: "invisible",
		});
	}

	getImage(tag) {
		switch (tag) {
			case "heart":
				return heart;
			case "warning":
				return warning;
			case "chat":
				return chat;
			case "devocional":
				return hand;
			case "inspirado":
				return pen;
			case "pessoal":
				return person;
			default:
				return book;
		}
	}

	closeNewCommentary(evt) {
		evt.preventDefault();

		this.titleComponent.current.selected = false;
		this.commentsComponent.current.selected = false;

		this.setState({
			blur: "none",
			newBoxClass: "invisible",
			navClass: "visible",
		});
	}

	addNewComment(comment) {
		if (comment.on_title) {
			const lista = this.state.titleComments;
			lista.push(comment);
			this.setState({ titleComments: lista });
		} else {
			const lista = this.state.comments;
			lista.push(comment);
			this.setState({ comments: lista });

			const all = this.state.allComments;
			all.push(comment);
			this.setState({ allComments: all });
		}
	}

	renderAmount(index) {
		let amount =
			index === false
				? this.state.titleComments.length
				: this.state.allComments.filter(
						(comment) => comment.verse === index + 1
				  ).length;

		if (amount === 0) {
			return;
		}

		const color =
			amount === 1
				? "lightgray"
				: amount < 3
				? "lightblue"
				: amount < 5
				? "lightgreen"
				: amount < 10
				? "gold"
				: "lightcoral";
		return (
			<div className="amount" style={{ backgroundColor: color }}>
				{amount}
			</div>
		);
	}

	handleLike(identificador) {
		function searchLike(comments) {
			let commentFound = false;
			comments.forEach(function (part, index, array) {
				if (array[index].id === identificador) {
					const likes = JSON.parse(array[index].likes);
					if (!("+1" in likes)) {
						likes.push("+1");
						array[index].likes = JSON.stringify(likes);
						commentFound = true;
					}
				}
			});
			return commentFound;
		}
		if (isAuthenticated()) {
			var token = localStorage.getItem(TOKEN_KEY);
			try {
				axios
					.patch(`comments/${identificador}`, {
						token,
						likes: true,
					})
					.then(() => {
						this.handleNotification(
							"success",
							"Adicionado aos favoritos"
						);
						const found = searchLike(this.state.comments);
						if (!found) {
							searchLike(this.state.titleComments);
						}
					});
			} catch (error) {
				this.handleNotification(
					"error",
					error.toString()
				);
			}
		} else {
			this.handleNotification(
				"warning",
				"Você precisa está logado"
			);
		}
	}

	handleReport(identificador) {
		if (isAuthenticated()) {
			var token = localStorage.getItem(TOKEN_KEY);
			const message = window.prompt("Qual o problema com o comentário?");
			try {
				axios
					.patch(`comments/${identificador}`, {
						token,
						reports: message,
					})
					.then(() => {
						this.handleNotification(
							"success",
							"Comentário reportado!"
						);
					});
			} catch (error) {
				this.handleNotification(
					"error",
					error.toString()
				);
			}
		} else {
			this.handleNotification(
				"warning",
				"Você precisa está logado"
			);
		}
	}

	goToDiscussion(comment) {
		this.props.history.push({
			pathname: `/discussion/${this.props.match.params.abbrev}`,
			state: {
				title: this.state.titleName,
				verse: comment.text,
				comment,
			},
		});
	}

	render() {
		return (
			<>
				<div className="chapter-container">
					<div className={this.state.navClass}>
						<NavBar changeChapter={this.loadChapter} />
					</div>
					<div className={this.state.mainClass}>
						<label htmlFor="toggle" style={{ display: "flex" }}>
							{this.state.titleName} {this.state.chapterNumber}{" "}
							{this.renderAmount(false)}
						</label>
						<input type="checkbox" id="toggle" />
						<TitleComment
							handleNewComment={this.handleNewComment}
							comments={this.state.titleComments}
							imageFunction={this.getImage}
							likeFunction={this.handleLike}
							reportFunction={this.handleReport}
							goToDiscussion={this.goToDiscussion}
							ref={this.titleComponent}
						/>

						<ul className="verse-list">
							{this.state.verses.length > 0 ? (
								this.state.verses.map((verse, index) => (
									<li key={verse}>
										<sup> {index + 1} </sup>
										<p
											style={{ display: "inline" }}
											onClick={(evt) => this.handleComments(evt, index)}
										>
											{verse}
										</p>
										{this.renderAmount(index)}
									</li>
								))
							) : (
								<Loading />
							)}
						</ul>
					</div>
				</div>
				<aside className={this.state.asideClass}>
					<Comments
						closeFunction={this.closeComments}
						commentaries={this.state.comments}
						imageFunction={this.getImage}
						handleNewComment={this.handleNewComment}
						likeFunction={this.handleLike}
						reportFunction={this.handleReport}
						goToDiscussion={this.goToDiscussion}
						ref={this.commentsComponent}
					/>
				</aside>

				<div className={this.state.newBoxClass}>
					<NewComment
						post
						title="Criar comentário"
						abbrev={this.abbrev}
						number={this.number}
						verso={this.getVerse}
						close={this.closeNewCommentary}
						addNewComment={this.addNewComment}
						on_title={this.titleComponent.current}
					/>
				</div>

				<div className="overlay" style={{ display: this.state.blur }} />
			</>
		);
	}
}
Chapter.propTypes = {
	match: PropTypes.shape({
		params: PropTypes.shape({
			abbrev: PropTypes.string.isRequired,
			number: PropTypes.number.isRequired,
		}),
	}),
};
