import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Heart,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import "./CommunityPage.css";

type CommunityPost = {
  id: number;
  author: string;
  initials: string;
  role: string;
  topic: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
};

const initialPosts: CommunityPost[] = [
  {
    id: 1,
    author: "Priya Sharma",
    initials: "PS",
    role: "Frontend Learner",
    topic: "Web Development",
    time: "Today",
    title: "What helped you understand React hooks?",
    content:
      "I'm learning useState and useEffect. Building small examples has helped me, but I'd love to hear which projects made these concepts click for you.",
    likes: 12,
    comments: 5,
    liked: false,
  },
  {
    id: 2,
    author: "Rahul Mehta",
    initials: "RM",
    role: "DSA Enthusiast",
    topic: "Programming",
    time: "Today",
    title: "My approach to practicing DSA consistently",
    content:
      "I've started solving one problem a day. I first write a straightforward solution, then try to improve its time complexity. What strategies work for you?",
    likes: 18,
    comments: 7,
    liked: false,
  },
  {
    id: 3,
    author: "Ananya Verma",
    initials: "AV",
    role: "AI Learner",
    topic: "Artificial Intelligence",
    time: "Yesterday",
    title: "Starting my machine learning journey",
    content:
      "I'm reviewing Python, NumPy, and basic statistics before moving into machine learning. If you're on a similar path, which beginner project would you recommend?",
    likes: 9,
    comments: 3,
    liked: false,
  },
  {
    id: 4,
    author: "Arjun Patel",
    initials: "AP",
    role: "Computer Science Student",
    topic: "Career & Projects",
    time: "Yesterday",
    title: "Share your favorite portfolio project ideas",
    content:
      "I want to build something more useful than a basic to-do list. I'm considering a study planner or a learning dashboard. What projects have taught you the most?",
    likes: 15,
    comments: 6,
    liked: false,
  },
];

const topics = [
  "All topics",
  "Web Development",
  "Programming",
  "Artificial Intelligence",
  "Career & Projects",
];

const avatarStyles = [
  "community-avatar-purple",
  "community-avatar-blue",
  "community-avatar-orange",
  "community-avatar-green",
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [activeTopic, setActiveTopic] = useState("All topics");
  const [showComposer, setShowComposer] = useState(false);
  const [myPostsOnly, setMyPostsOnly] = useState(false);

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTopic, setPostTopic] = useState("Web Development");

  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>(
    {},
  );
  const [comments, setComments] = useState<Record<number, string[]>>({});

  const filteredPosts = posts.filter((post) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      `${post.title} ${post.content} ${post.author} ${post.topic}`
        .toLowerCase()
        .includes(query);

    const matchesTopic =
      activeTopic === "All topics" || post.topic === activeTopic;

    const matchesAuthor = !myPostsOnly || post.role === "You";

    return matchesSearch && matchesTopic && matchesAuthor;
  });

  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

  function toggleLike(postId: number) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.likes + (post.liked ? -1 : 1),
            }
          : post,
      ),
    );
  }

  function createPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = postTitle.trim();
    const content = postContent.trim();

    if (!title || !content) return;

    const newPost: CommunityPost = {
      id: posts.reduce((maximum, post) => Math.max(maximum, post.id), 0) + 1,
      author: "You",
      initials: "YO",
      role: "You",
      topic: postTopic,
      time: "Just now",
      title,
      content,
      likes: 0,
      comments: 0,
      liked: false,
    };

    setPosts((current) => [newPost, ...current]);
    setPostTitle("");
    setPostContent("");
    setShowComposer(false);
    setActiveTopic("All topics");
    setSearch("");
    setMyPostsOnly(false);
  }

  function toggleComments(postId: number) {
    setExpandedComments((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  }

  function addComment(event: React.FormEvent<HTMLFormElement>, postId: number) {
    event.preventDefault();

    const text = (commentDrafts[postId] ?? "").trim();

    if (!text) return;

    setComments((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), text],
    }));

    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post,
      ),
    );

    setCommentDrafts((current) => ({
      ...current,
      [postId]: "",
    }));
  }

  function resetFilters() {
    setSearch("");
    setActiveTopic("All topics");
    setMyPostsOnly(false);
  }

  return (
    <main className="community-page">
      <header className="community-header">
        <div>
          <span className="community-eyebrow">
            <Users size={15} />
            LEARN, SHARE, AND GROW
          </span>

          <h1>Community</h1>

          <p>
            Connect with learners, exchange ideas, and celebrate progress
            together.
          </p>
        </div>

        <button
          type="button"
          className="community-create-button"
          onClick={() => setShowComposer((current) => !current)}
        >
          {showComposer ? <X size={17} /> : <Plus size={17} />}
          {showComposer ? "Cancel" : "Create post"}
        </button>
      </header>

      <section className="community-stats">
        <article className="community-stat-card">
          <span className="community-stat-icon community-stat-purple">
            <Users size={20} />
          </span>
          <div>
            <strong>1,250+</strong>
            <span>Learners</span>
          </div>
        </article>

        <article className="community-stat-card">
          <span className="community-stat-icon community-stat-blue">
            <MessageCircle size={20} />
          </span>
          <div>
            <strong>{posts.length}</strong>
            <span>Discussions</span>
          </div>
        </article>

        <article className="community-stat-card">
          <span className="community-stat-icon community-stat-orange">
            <Heart size={20} />
          </span>
          <div>
            <strong>{totalLikes}</strong>
            <span>Post likes</span>
          </div>
        </article>
      </section>

      <section className="community-banner">
        <div className="community-banner-icon">
          <Sparkles size={27} />
        </div>

        <div>
          <h2>Great things happen when we learn together.</h2>
          <p>
            Ask questions, share what you're building, and help someone
            understand a new concept.
          </p>
        </div>
      </section>

      {showComposer && (
        <section className="community-composer-panel">
          <div className="community-composer-heading">
            <div>
              <h2>Start a discussion</h2>
              <p>Share a question, idea, or learning milestone.</p>
            </div>
          </div>

          <form className="community-composer-form" onSubmit={createPost}>
            <label>
              Discussion title
              <input
                value={postTitle}
                onChange={(event) => setPostTitle(event.target.value)}
                placeholder="What would you like to discuss?"
                maxLength={120}
                required
              />
            </label>

            <label>
              Topic
              <select
                value={postTopic}
                onChange={(event) => setPostTopic(event.target.value)}
              >
                {topics
                  .filter((topic) => topic !== "All topics")
                  .map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
              </select>
            </label>

            <label className="community-composer-full">
              Your message
              <textarea
                value={postContent}
                onChange={(event) => setPostContent(event.target.value)}
                placeholder="Share your thoughts with the community..."
                rows={4}
                maxLength={2000}
                required
              />
            </label>

            <div className="community-composer-footer community-composer-full">
              <span>{postContent.length}/2000 characters</span>

              <button type="submit" className="community-create-button">
                <Send size={15} />
                Publish post
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="community-layout">
        <section className="community-feed">
          <div className="community-feed-heading">
            <div>
              <h2>Community discussions</h2>
              <p>Explore conversations from fellow learners.</p>
            </div>

            <button
              type="button"
              className={`community-my-posts ${
                myPostsOnly ? "community-my-posts-active" : ""
              }`}
              onClick={() => setMyPostsOnly((current) => !current)}
            >
              <BookOpen size={15} />
              {myPostsOnly ? "All posts" : "My posts"}
            </button>
          </div>

          <label className="community-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search discussions, topics, or people..."
              aria-label="Search community posts"
            />
          </label>

          <div className="community-topic-tabs">
            {topics.map((topic) => (
              <button
                type="button"
                key={topic}
                className={`community-topic-tab ${
                  activeTopic === topic ? "community-topic-active" : ""
                }`}
                onClick={() => setActiveTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="community-post-list">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post, index) => {
                const isExpanded = expandedComments.includes(post.id);
                const postComments = comments[post.id] ?? [];

                return (
                  <article className="community-post-card" key={post.id}>
                    <div className="community-post-author">
                      <span
                        className={`community-avatar ${
                          post.role === "You"
                            ? "community-avatar-own"
                            : avatarStyles[index % avatarStyles.length]
                        }`}
                      >
                        {post.initials}
                      </span>

                      <div className="community-author-info">
                        <strong>{post.author}</strong>
                        <span>
                          {post.role} <span aria-hidden="true">·</span>{" "}
                          {post.time}
                        </span>
                      </div>

                      <span className="community-post-topic">{post.topic}</span>
                    </div>

                    <div className="community-post-content">
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                    </div>

                    <div className="community-post-actions">
                      <button
                        type="button"
                        className={`community-like-button ${
                          post.liked ? "community-liked" : ""
                        }`}
                        onClick={() => toggleLike(post.id)}
                        aria-pressed={post.liked}
                      >
                        <Heart
                          size={17}
                          fill={post.liked ? "currentColor" : "none"}
                        />
                        {post.likes} {post.likes === 1 ? "Like" : "Likes"}
                      </button>

                      <button
                        type="button"
                        className="community-comment-button"
                        onClick={() => toggleComments(post.id)}
                        aria-expanded={isExpanded}
                      >
                        <MessageCircle size={17} />
                        {post.comments}{" "}
                        {post.comments === 1 ? "Comment" : "Comments"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="community-comments">
                        {postComments.length > 0 ? (
                          postComments.map((comment, commentIndex) => (
                            <div
                              className="community-comment"
                              key={`${post.id}-${commentIndex}`}
                            >
                              <span className="community-comment-avatar">
                                YO
                              </span>
                              <div>
                                <strong>You</strong>
                                <p>{comment}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="community-no-comments">
                            No comments yet. Start the conversation.
                          </p>
                        )}

                        <form
                          className="community-comment-form"
                          onSubmit={(event) => addComment(event, post.id)}
                        >
                          <input
                            value={commentDrafts[post.id] ?? ""}
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [post.id]: event.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            aria-label={`Comment on ${post.title}`}
                            maxLength={500}
                          />

                          <button
                            type="submit"
                            aria-label="Send comment"
                            disabled={!(commentDrafts[post.id] ?? "").trim()}
                          >
                            <Send size={15} />
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="community-empty-state">
                <Search size={27} />
                <h3>No discussions found</h3>
                <p>Try another search or topic, or create a new discussion.</p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="community-reset-button"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="community-sidebar">
          <section className="community-sidebar-card">
            <div className="community-sidebar-heading">
              <Sparkles size={18} />
              <h3>Community guidelines</h3>
            </div>

            <ul className="community-guidelines">
              <li>Be respectful and supportive.</li>
              <li>Ask clear, constructive questions.</li>
              <li>Share knowledge and useful resources.</li>
              <li>Respect other learners' privacy.</li>
            </ul>
          </section>

          <section className="community-sidebar-card community-topics-card">
            <div className="community-sidebar-heading">
              <BookOpen size={18} />
              <h3>Explore topics</h3>
            </div>

            {topics
              .filter((topic) => topic !== "All topics")
              .map((topic) => (
                <button
                  type="button"
                  className="community-topic-link"
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                >
                  <span>{topic}</span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
          </section>

          <section className="community-help-card">
            <div className="community-help-icon">
              <MessageCircle size={22} />
            </div>

            <h3>Have a learning question?</h3>
            <p>
              Think through the problem and explain what you've tried so far.
            </p>
          </section>
        </aside>
      </div>

      <footer className="community-footer">
        <span>© 2026 VertexLearn AI</span>
        <span>Learn together. Grow together.</span>
      </footer>
    </main>
  );
}
