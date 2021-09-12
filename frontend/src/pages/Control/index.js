import React, { Component } from "react";
import axios from "../../services/api";
import { Pagination } from "@material-ui/lab";

import { isAuthenticated, TOKEN_KEY } from "../../services/auth";
import "./styles.css";

const PAGE_LENGTH = 5;

export default class Control extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authorized: false,
			comments: [],
			users: [],
			discussions: [],

			usersPagesTotal: 0,
			commentsLength: 0,

			commentsPage: 1,
			usersPage: 1,
			discussionLength: 0,
			discussionsPage: 1,
		};

		this.changeUsersPage = this.changeUsersPage.bind(this);
		this.changeCommentPage = this.changeCommentPage.bind(this);
		this.changeDiscussionsPage = this.changeDiscussionsPage.bind(this);
		
		this.handleLoadUsers = this.handleLoadUsers.bind(this);
		this.handleLoadComments = this.handleLoadComments.bind(this);
		this.handleLoadDiscussion = this.handleLoadDiscussion.bind(this);
	}

	async getUsers(currentPage = 1) {
		const { users } = this.state;
		const { data: newUsers } = await axios.get("users", 
			{ params: { pages: currentPage } });
		
		const usersSum = users.length + newUsers.length;
		const newTotal = Math.ceil(usersSum / PAGE_LENGTH);

		this.setState(prevState => ({
			users: [...prevState.users, ...newUsers]
		}))

		if (newUsers.length === PAGE_LENGTH) {
			this.setState({ usersPagesTotal: newTotal + 1 });
		} else {
			this.setState({
				usersPagesTotal: newTotal,
				usersPage: currentPage - 1,
			});
		}
	}

	async getComments(currentPage = 1) {
		const { comments } = this.state;

		const { data: dataComments } = await axios.get("comments", 
			{ params: { pages: currentPage } });
		const newComments = dataComments.map((item) => {
			item.likes = JSON.parse(item.likes);
			item.reports = JSON.parse(item.reports);
			return item;
		})
		const commentsSum = comments.length + newComments.length;
		const newTotal = Math.ceil(commentsSum / PAGE_LENGTH);

		this.setState((prevState) => ({
			comments: [...prevState.comments, ...newComments],
		}));
		if (newComments.length === PAGE_LENGTH) {
			this.setState({ commentsLength: newTotal + 1 });
		} else {
			this.setState({
				commentsPage: currentPage - 1,
				commentsLength: newTotal,
			});
		}
	}

	async getDiscussions(currentPage = 1) {
		const { discussions } = this.state;

		const { data: newDiscussions } = await axios.get(
			"discussions", { params: { pages: currentPage } });
		
		const discussionSum = discussions.length + newDiscussions.length;
		const newTotal = Math.ceil(discussionSum / PAGE_LENGTH);

		this.setState(prevState => ({
			discussions: [...prevState.discussions, ...newDiscussions],
		}));
		if (newDiscussions.length === PAGE_LENGTH) {
			this.setState({ discussionLength: newTotal + 1 });
		} else {
			this.setState({
				discussionsPage: currentPage - 1,
				discussionLength: newTotal,
			});
		}
	}

	componentDidMount() {
		function getUser(token) {
			return axios.get("session", {
				headers: { token: token },
			});
		}

		if (isAuthenticated()) {
			getUser(localStorage.getItem(TOKEN_KEY)).then((response) => {
				if (response.data.moderator) {
					this.setState({ authorized: true });
					this.getUsers();
					this.getComments();
					this.getDiscussions();
				}
			});
		}
	}

	async deleteAccount(evt) {
		const email = evt.target.getAttribute('data-email');
		await axios
			.delete("users", {
				data: { token: localStorage.getItem(TOKEN_KEY), email },
			})
			.then((response) => {
				if (typeof response.data.error === "undefined") {
					this.setState((prevState) => ({
						users: prevState.users.filter((user) => user.email !== email),
					}));
				}
			});
	}

	async deleteComment(evt) {
		const id = evt.target.getAttribute('data-id');
		await axios
			.delete(`comments/${id}`, {
				headers: { token: localStorage.getItem(TOKEN_KEY) },
			})
			.then((response) => {
				if (typeof response.data.error === "undefined") {
					this.setState((prevState) => ({
						comments: prevState.comments.filter((comment) => comment.id !== id),
					}));
				}
			});
	}

	async deleteDiscussion(evt) {
		const id = evt.target.getAttribute('data-id');
		await axios
			.delete(`discussion/${id}`, {
				data: { token: localStorage.getItem(TOKEN_KEY) },
			})
			.then((response) => {
				if (typeof response.data.error === "undefined") {
					this.setState((prevState) => ({
						discussions: prevState.discussions.filter(
							(discussion) => discussion.id !== id
						),
					}));
				}
			});
	}

	calculatePagination(type) {
		let page = 0;
		let array = [];
		if (type === "users") {
			page = this.state.usersPage;
			array = this.state.users;
		} else if (type === "comments") {
			page = this.state.commentsPage;
			array = this.state.comments;
		} else {
			page = this.state.discussionsPage;
			array = this.state.discussions;
		}
		const inicio = (page - 1) * PAGE_LENGTH;
		const final = inicio + PAGE_LENGTH;

		return array.slice(inicio, final);
	}

	changeUsersPage(_, page) {
		this.setState({ usersPage: page });
	}
	changeCommentPage(_, page) {
		this.setState({ commentsPage: page });
	}
	changeDiscussionsPage(_, page) {
		this.setState({ discussionsPage: page });
	}

	handleLoadUsers() {
		this.getUsers(this.state.usersPage);
	}
	handleLoadComments() {
		this.getComments(this.state.commentsPage);
	}
	handleLoadDiscussion() {
		this.getDiscussions(this.state.discussionsPage);
	}

	render() {
		return this.state.authorized ? (
			<main className="control">
				<h1> Painel de Controle </h1>

				<div className="control-container">
					<ul>
						<h3> Usuários </h3>
						{this.calculatePagination("users").length > 0 ? (
							this.calculatePagination("users").map((user) => (
								<li key={user.email}>
									<label style={{ display: "flex" }} htmlFor={user.email}>
										<p> {user.email} </p>
									</label>
									<input type="checkbox" id={user.email} />
									<div
										className="user-comment"
										style={{ alignItems: "flex-start" }}
									>
										<p> E-mail: {user.email} </p>
										<p> Name: {user.name} </p>
										<p> State: {user.state} </p>
										<p> Belief: {user.belief} </p>
										<p> Since: {user.created_at} </p>
										<p> Total Comments: {user.total_comments} </p>
										<div className="config-buttons">
											<button
												style={{
													backgroundColor: "#FF4030",
												}}
												data-email = {user.email}
												onClick={this.deleteAccount}
											>
												Deletar
											</button>
										</div>
									</div>
								</li>
							))
						) : (
							<button className="load-btn"
								onClick={this.handleLoadUsers}
							>
								Carregar
							</button>
						)}
						<Pagination
							showFirstButton
							showLastButton
							size="small"
							shape="rounded"
							page={this.state.usersPage}
							onChange={this.changeUsersPage}
							count={this.state.usersPagesTotal}
						/>
					</ul>
					<ul>
						<h3> Últimos comentários </h3>
						{this.calculatePagination("comments").length > 0 ? (
							this.calculatePagination("comments").map((comment) => (
								<li key={comment.id}>
									<label style={{ display: "flex" }} htmlFor={comment.text}>
										<p>
											{comment.book_reference} {comment.text}
										</p>
									</label>
									<input type="checkbox" id={comment.text} />
									<div className="user-comment">
										<p> Por: {comment.username}</p>
										<p> {comment.text} </p>
										<p> Denúncias: {comment.reports.length}</p>
										<p> Favoritos: {comment.likes.length}</p>

										{comment.reports.length > 0 ? (
											<ul style={{ width: "100%" }}>
												<h4> Denúncias </h4>
												{comment.reports.map((report) => (
													<li key={report.msg}>
														<h5> {report.user} </h5>
														<p> {report.msg} </p>
													</li>
												))}
											</ul>
										) : (
											<></>
										)}

										<div className="config-buttons">
											<button
												style={{
													backgroundColor: "#FF4030",
												}}
												data-id = {comment.id}
												onClick={this.deleteComment}
											>
												Deletar
											</button>
										</div>
									</div>
								</li>
							))
						) : (
							<button className="load-btn"
								onClick={this.handleLoadComments}
							>
								Carregar
							</button>
						)}
						<Pagination
							showFirstButton
							showLastButton
							size="small"
							shape="rounded"
							page={this.state.commentsPage}
							count={this.state.commentsLength}
							onChange={this.changeCommentPage}
						/>
					</ul>
					<ul>
						<h3> Discussões </h3>
						{this.calculatePagination("discussions").length > 0 ? (
							this.calculatePagination("discussions").map((discussion) => (
								<li key={discussion.id * -1}>
									<label
										style={{ display: "flex" }}
										htmlFor={discussion.question}
									>
										<p>
											{" "}
											{discussion.book_abbrev} {discussion.verse_reference} -
											{discussion.question}{" "}
										</p>
									</label>
									<input type="checkbox" id={discussion.question} />
									<div className="user-comment">
										<p> Por: {discussion.username}</p>
										<p> {discussion.verse_text} </p>
										<hr />
										<p> {discussion.comment_text}</p>
										<hr />
										<p> {discussion.question} </p>

										<div className="config-buttons">
											<button
												style={{
													backgroundColor: "#FF4030",
												}}
												data-id = {discussion.id}
												onClick={this.deleteDiscussion}
											>
												Deletar
											</button>
										</div>
									</div>
								</li>
							))
						) : (
							<button className="load-btn"
								onClick={this.handleLoadDiscussion}
							>
								Carregar
							</button>
						)}
						<Pagination
							showFirstButton
							showLastButton
							size="small"
							shape="rounded"
							page={this.state.discussionsPage}
							count={this.state.discussionLength}
							onChange={this.changeDiscussionsPage}
						/>
					</ul>
				</div>
			</main>
		) : (
			<h1> Não autorizado </h1>
		);
	}
}
