body {
  font-family: "Poppins", sans-serif;
  background: #f0f4ff;
  color: #222;
  margin: 0;
}

header {
  background: #1e3a8a;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

nav a.active {
  text-decoration: underline;
}

#menuBtn {
  display: none;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: white;
}

main {
  padding: 2rem;
  text-align: center;
}

.content {
  max-width: 600px;
  margin: auto;
  text-align: left;
}

footer {
  background: #1e3a8a;
  color: white;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 768px) {
  nav {
    display: none;
    flex-direction: column;
    background: #1e3a8a;
    text-align: center;
    padding: 1rem;
  }
  nav.show {
    display: flex;
  }
  #menuBtn {
    display: block;
  }
}
