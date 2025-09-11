
import { Link } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { pdf, excel } from "../../utils/imagepath";

const TooltipIcons = () => {
  return (
    <>
      <li>
        <Tooltip data-pr-tooltip="Pdf" data-pr-position="top">
          <Link to="#">
            <img src={pdf} alt="img" />
          </Link>
        </Tooltip>
      </li>
      <li>
        <Tooltip data-pr-tooltip="Excel" data-pr-position="top">
          <Link to="#">
            <img src={excel} alt="img" />
          </Link>
        </Tooltip>
      </li>
    </>
  );
};

export default TooltipIcons;
