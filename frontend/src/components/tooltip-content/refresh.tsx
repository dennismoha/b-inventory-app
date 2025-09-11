// type RefreshIconProps = {
//   fn: () => void | Promise<void>;
// };

// const RefreshIcon: React.FC<RefreshIconProps> = ({ fn }) => {
//   const handleClick = (e: React.MouseEvent) => {
//     e.preventDefault(); // stops navigation
//     e.stopPropagation();
//     fn(); // call parent handler
//   };

//   return (
//     <li>
//       <button onClick={handleClick} className="pr-tooltip" data-pr-tooltip="Refresh" data-pr-position="top">
//         {/* <i className="ti ti-refresh" /> */}
//       </button>
//     </li>
//   );
// };

// export default RefreshIcon;

import { Link } from 'react-router-dom';
const RefreshIcon = () => {
  return (
    <li>
      <Link to="#" className="pr-tooltip" data-pr-tooltip="Refresh" data-pr-position="top">
        <i className="ti ti-refresh" />
      </Link>
    </li>
  );
};

export default RefreshIcon;
