/* eslint-disable no-unused-vars */


export function itemRender(_currentp:any, type:any, originalElement:any) {
    if (type === "prev") {
      return <a>Previous</a>;
    }
    if (type === "next") {
      return <a>Next</a>;
    }
    return originalElement;
  }

  export function onShowSizeChange(_current:any, _pageSize:any) {
    // console.log(current, pageSize);
  }