function Signout({ setActiveContent }) {
  return (
    <div>
      <ul>
        <li onClick={() => setActiveContent("signout")}>
          <a href="/">Sign Out</a>
        </li>
      </ul>
    </div>
  );
}

export default Signout;
