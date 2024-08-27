import { Link, useRouteError } from "react-router-dom";
import Wrapper from "../assets/wrappers/ErrorPage";
import img from "../assets/images/not-found.svg"

const Error = () => {

  const error = useRouteError();
  if (error.status === 404) {
    return (
      <Wrapper>
        <div>
          <img src={img} alt="not-found" />
          <h3>Oh gosh!</h3>
          <p>These are not the droids you are looking for</p>
          <Link to="/dashboard">Back Home</Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div>Something went wrong</div>
    </Wrapper>
  );
}

export default Error;