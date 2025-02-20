import "./styles.css";

import React, { Component } from "react";
import axios from "services/api";
import PropTypes from "prop-types";

import { NotificationContext } from "contexts/NotificationContext";
import { isAuthenticated, TOKEN_KEY } from "services/auth";
import { Loading } from "components/Partials";

import TitleComment from "components/TitleComments";
import NewComment from "components/NewComment";
import Comments from "components/Comments";
import Header from "components/Header";

import bookIcon from "assets/book.svg";
import chatIcon from "assets/chat.svg";
import handIcon from "assets/hand.svg";
import heartIcon from "assets/heart.svg";
import penIcon from "assets/pen.svg";
import personIcon from "assets/person.svg";
import warningIcon from "assets/warning.svg";

function getIconImage(tag) {
	switch (tag) {
		case "heart":
			return heartIcon;
		case "warning":
			return warningIcon;
		case "chat":
			return chatIcon;
		case "devocional":
			return handIcon;
		case "inspirado":
			return penIcon;
		case "pessoal":
			return personIcon;
		default:
			return bookIcon;
	}
}

export default class Chapter extends Component {
	static contextType = NotificationContext;

	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				abbrev: PropTypes.string.isRequired,
				number: PropTypes.string.isRequired,
			}),
		}).isRequired,
		history: PropTypes.shape({
			push: PropTypes.func.isRequired,
		}).isRequired,
	};

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
			currentVerse: -1,
			newTitleComment: false,
		};

		// to use the state of parent in the children
		this.getVerse = this.getVerse.bind(this);
		this.loadChapter = this.loadChapter.bind(this);
		this.goToDiscussion = this.goToDiscussion.bind(this);

		this.onHandleLike = this.handleLike.bind(this);
		this.onHandleReport = this.handleReport.bind(this);
		this.onHandleNewComment = this.handleNewComment.bind(this);

		this.closeComments = this.closeComments.bind(this);
		this.closeNewCommentary = this.closeNewCommentary.bind(this);

		this.handleComments = this.handleComments.bind(this);
		this.addNewComment = this.addNewComment.bind(this);
	}

	componentDidMount() {
		const { abbrev, number } = this.props.match.params;
		const { handleNotification } = this.context;

		this.loadChapter(abbrev, number);
		this.handleNotification = handleNotification;
	}

	getVerse() {
		return this.state.currentVerse;
	}

	loadChapter(abbrev, number) {
		this.abbrev = abbrev;
		this.number = number;

		axios
			.get(`/books/${abbrev}/chapters/${number}/`)
			.then(({ data }) => {
				const { title, verses } = data;
				this.setState({ titleName: title });
				this.setState({ verses: JSON.parse(verses) });
			})
			.catch((error) => {
				if (error.response) {
					this.handleNotification("error", error.response.data.error);
				} else {
					this.handleNotification(
						"error",
						`Problema no servidor: ${error.toString()}`
					);
				}
			});

		axios
			.get(`/books/${abbrev}/chapters/${number}/comments`)
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

					this.setState({
						allComments: comments,
						titleComments,
					});
				}
			})
			.catch((error) => {
				if (error.response) {
					this.handleNotification("error", error.response.data.error);
				} else {
					this.handleNotification(
						"error",
						`Problema no servidor: ${error.toString()}`
					);
				}
			});

		const newChapterNumber = number.length === 1 ? `0${number}` : number;
		this.setState({ chapterNumber: newChapterNumber });
		return true;
	}

	handleComments(event) {
		const target = event.target;
		const { currentVerse } = this.state;
		const numberVerse = parseInt(target.getAttribute("data-index"), 10);

		if (currentVerse === numberVerse) {
			this.closeComments(event);
		} else {
			this.setState((prevState) => ({
				asideClass: "visible",
				mainClass: "main comment",
				navClass: prevState.navClass.includes("navHide")
					? prevState.navClass
					: `${prevState.navClass} navHide`,
				comments: prevState.allComments.filter(
					(comment) => comment.verse === numberVerse + 1
				),
				currentVerse: numberVerse,
			}));
		}
	}

	closeComments() {
		this.setState({
			currentVerse: -1,
			comments: [],
			asideClass: "invisible",
			mainClass: "main text",
			navClass: "visible",
		});
	}

	handleNewComment(evt, isTitle = false) {
		evt.preventDefault();

		this.setState({
			newBoxClass: "visible centro",
			newTitleComment: isTitle,
			navClass: "invisible",
			blur: "block",
		});
	}

	closeNewCommentary(evt) {
		evt.preventDefault();
		this.setState({
			blur: "none",
			navClass: "visible",
			newBoxClass: "invisible",
		});
	}

	addNewComment(comment) {
		if (comment.on_title) {
			this.setState((prevState) => ({
				titleComments: [...prevState.titleComments, comment],
			}));
		} else {
			this.setState((prevState) => ({
				comments: [...prevState.comments, comment],
				allComments: [...prevState.allComments, comment],
			}));
		}
	}

	renderAmount(index) {
		const { allComments, titleComments } = this.state;
		const allCommentsLength = allComments.filter(
			(comment) => comment.verse === index + 1
		).length;

		let amount = titleComments.length;
		if (index !== false) {
			amount = allCommentsLength;
		}

		if (amount === 0) {
			return <></>;
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
			comments.forEach((part, index, array) => {
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
			try {
				axios
					.patch(`comments/${identificador}`, {
						token: localStorage.getItem(TOKEN_KEY),
						likes: true,
					})
					.then(() => {
						this.handleNotification("success", "Adicionado aos favoritos");

						const { comments, titleComments } = this.state;
						const found = searchLike(comments);
						if (!found) {
							searchLike(titleComments);
						}
					});
			} catch (error) {
				this.handleNotification("error", error.toString());
			}
		} else {
			this.handleNotification("warning", "Você precisa está logado");
		}
	}

	handleReport(identificador) {
		if (isAuthenticated()) {
			const token = localStorage.getItem(TOKEN_KEY);
			const message = window.prompt("Qual o problema com o comentário?");
			try {
				axios
					.patch(`comments/${identificador}`, {
						token,
						reports: message,
					})
					.then(() => {
						this.handleNotification("success", "Comentário reportado!");
					});
			} catch (error) {
				this.handleNotification("error", error.toString());
			}
		} else {
			this.handleNotification("warning", "Você precisa está logado");
		}
	}

	goToDiscussion(comment_id, comment_text, comment_reference) {
		const { abbrev } = this.props.match.params;
		this.props.history.push({
			pathname: `/discussion/${abbrev}`,
			state: {
				title: this.state.titleName,
				comment_id: parseInt(comment_id, 10),
				comment_text,
				comment_reference,
			},
		});
	}

	render() {
		return (
			<>
				<Header changeChapter={this.loadChapter} />
				<div className="container">
					<div className="chapter-container">
						<div className={this.state.mainClass}>
							<label htmlFor="toggle" style={{ display: "flex" }}>
								{this.state.titleName} {this.state.chapterNumber}{" "}
								{this.renderAmount(false)}
							</label>
							<input type="checkbox" id="toggle" />
							<TitleComment
								imageFunction={getIconImage}
								likeFunction={this.onHandleLike}
								reportFunction={this.onHandleReport}
								comments={this.state.titleComments}
								discussionFunction={this.goToDiscussion}
								handleNewComment={this.onHandleNewComment}
							/>

							<ul className="verse-list">
								{this.state.verses.length > 0 ? (
									this.state.verses.map((verse, index) => (
										<li key={`${index}${verse}`} id={index + 1}>
											<sup> {index + 1} </sup>
											<p
												data-index={index}
												style={{
													display: "inline",
													backgroundColor:
														index === this.state.currentVerse
															? "yellow"
															: "white",
												}}
												onClick={this.handleComments}
												onKeyUp={this.handleComments}
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
							imageFunction={getIconImage}
							likeFunction={this.onHandleLike}
							comments={this.state.comments}
							closeFunction={this.closeComments}
							reportFunction={this.onHandleReport}
							discussionFunction={this.goToDiscussion}
							handleNewComment={this.onHandleNewComment}
						/>
					</aside>

					<div className={this.state.newBoxClass}>
						<NewComment
							post
							abbrev={this.abbrev}
							number={this.number}
							verso={this.getVerse}
							title="Criar comentário"
							close={this.closeNewCommentary}
							addNewComment={this.addNewComment}
							isTitleComment={this.state.newTitleComment}
						/>
					</div>

					<div className="overlay" style={{ display: this.state.blur }} />
				</div>
			</>
		);
	}
}
