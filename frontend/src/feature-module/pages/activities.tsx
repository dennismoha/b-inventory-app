import { Link } from "react-router-dom";

import { all_routes } from "../../routes/all_routes";
import { customer4, profile3, profile4, profile5 } from "../../utils/imagepath";

const route = all_routes;

const Activities = () => {
  return (
    <div className="page-wrapper">
      <div className="content mb-4">
        <div className="page-header">
          <div className="page-title">
            <h4>All Notifications</h4>
            <h6>View your all activities</h6>
          </div>
        </div>
        <div className="card mb-3 border shadow-none">
          <div className="px-3 py-3">
            <div
              className="d-flex align-items-center"
              data-toggle="tooltip"
              data-placement="right"
              data-title="2 hrs ago"
              data-original-title=""
              title=""
            >
              <div className="d-flex me-2">
                <Link
                  to={route.profile}
                  className="avatar avatar-lg avatar-rounded"
                >
                  <img src={profile3} alt="Elwis Mathew" />
                </Link>
              </div>
              <div className="flex-fill ml-3">
                <p className="text-sm lh-140 mb-0">
                  <Link to={route.profile} className="h6">
                    Elwis Mathew
                  </Link>{" "}
                  <span>added a new product</span>{" "}
                  <Link to="#;" className="h6">
                    Redmi Pro 7 Mobile
                  </Link>
                </p>
                <small>
                  <i className="far fa-clock me-1" />
                  Just Now
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-3 border shadow-none">
          <div className="px-3 py-3">
            <div
              className="d-flex align-items-center"
              data-toggle="tooltip"
              data-placement="right"
              data-title="2 hrs ago"
              data-original-title=""
              title=""
            >
              <div className="d-flex me-2">
                <Link
                  to={route.profile}
                  className="avatar avatar-lg avatar-rounded"
                >
                  <img src={profile4} alt="Elizabeth Olsen" />
                </Link>
              </div>
              <div className="flex-fill ml-3">
                <p className="text-sm lh-140 mb-0">
                  <Link to={route.profile} className="h6">
                    Elizabeth Olsen
                  </Link>{" "}
                  <span>added a new product category</span>{" "}
                  <Link to="#;" className="h6">
                    Desktop Computers
                  </Link>
                </p>
                <small>
                  <i className="far fa-clock me-1" />4 min ago
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-3 border shadow-none">
          <div className="px-3 py-3">
            <div
              className="d-flex align-items-center"
              data-toggle="tooltip"
              data-placement="right"
              data-title="2 hrs ago"
              data-original-title=""
              title=""
            >
              <div className="d-flex me-2">
                <Link
                  to={route.profile}
                  className="avatar avatar-lg avatar-rounded"
                >
                  <img src={profile5} alt="William Smith" />
                </Link>
              </div>
              <div className="flex-fill ml-3">
                <p className="text-sm lh-140 mb-0">
                  <Link to={route.profile} className="h6">
                    William Smith
                  </Link>{" "}
                  <span>added a new sales list for</span>{" "}
                  <Link to="#;" className="h6">
                    January Month
                  </Link>
                </p>
                <small>
                  <i className="far fa-clock me-1" />6 min ago
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-3 border shadow-none">
          <div className="px-3 py-3">
            <div
              className="d-flex align-items-center"
              data-toggle="tooltip"
              data-placement="right"
              data-title="2 hrs ago"
              data-original-title=""
              title=""
            >
              <div className="d-flex me-2">
                <Link
                  to={route.profile}
                  className="avatar avatar-lg avatar-rounded"
                >
                  <img src={customer4} alt="Lesley Grauer" />
                </Link>
              </div>
              <div className="flex-fill ml-3">
                <p className="text-sm lh-140 mb-0">
                  <Link to={route.profile} className="h6">
                    Lesley Grauer
                  </Link>{" "}
                  <span>has updated invoice</span>{" "}
                  <Link to="#;" className="h6">
                    #987654
                  </Link>
                </p>
                <small>
                  <i className="far fa-clock me-1" />
                  12 min ago
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-3 border shadow-none">
          <div className="px-3 py-3">
            <div
              className="d-flex align-items-center"
              data-toggle="tooltip"
              data-placement="right"
              data-title="2 hrs ago"
              data-original-title=""
              title=""
            >
              <div className="d-flex me-2">
                <span className="avatar avatar-lg bg-success avatar-rounded">
                  <span className="avatar-title">CE</span>
                </span>
              </div>
              <div className="flex-fill ml-3">
                <p className="text-sm lh-140 mb-0">
                  <Link to={route.profile} className="h6">
                    Carl Evans
                  </Link>{" "}
                  <span>adjust the stock</span>{" "}
                  <Link to="#;" className="h6">
                    Apple Series 5 Watch
                  </Link>
                </p>
                <small>
                  <i className="far fa-clock me-1" />2 days ago
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="card mb-3 border shadow-none">
          <div className="px-3 py-3">
            <div
              className="d-flex align-items-center"
              data-toggle="tooltip"
              data-placement="right"
              data-title="2 hrs ago"
              data-original-title=""
              title=""
            >
              <div className="d-flex me-2">
                <Link
                  to={route.profile}
                  className="avatar avatar-lg bg-primary avatar-rounded"
                >
                  <span className="avatar-title">MR</span>
                </Link>
              </div>
              <div className="flex-fill ml-3">
                <p className="text-sm lh-140 mb-0">
                  <Link to={route.profile} className="h6">
                    Minerva Rameriz
                  </Link>{" "}
                  <span>accepted Quotation</span>{" "}
                  <Link to="#;" className="h6">
                    #QUO0001
                  </Link>
                </p>
                <small>
                  <i className="far fa-clock me-1" />1 month ago
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2014 - 2025 © DreamsPOS. All Right Reserved</p>
        <p>
          Designed &amp; Developed by{" "}
          <Link to="#;" className="text-primary">
            Dreams
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Activities;
