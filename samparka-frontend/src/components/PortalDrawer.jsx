import { useMemo, useCallback, useRef } from "react";

import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const PortalDrawer = ({
  children,
  overlayColor,
  placement = "Left",
  onOutsideClick,
  zIndex = 100,
}) => {
  const drawerStyle = useMemo(() => {
    const style = {};
    style.zIndex = zIndex;

    // Default to semi-transparent overlay, use provided color if specified
    style.backgroundColor = overlayColor || "rgba(113, 113, 113, 0.3)";

    switch (placement) {
      case "Left":
        style.alignItems = "flex-start";
        break;
      case "Right":
        style.alignItems = "flex-end";
        break;
      case "Top":
        style.alignItems = "center";
        break;
      case "Bottom":
        style.alignItems = "center";
        style.justifyContent = "flex-end";
        break;
    }

    return style;
  }, [placement, overlayColor, zIndex]);

  const onOverlayClick = useCallback(
    (e) => {
      if (onOutsideClick && e.target.classList.contains("portalPopupOverlay")) {
        onOutsideClick();
      }
      e.stopPropagation();
    },
    [onOutsideClick]
  );

  return (
    <DrawerContainer>
      <div
        className="flex flex-col fixed inset-0 portalPopupOverlay"
        style={drawerStyle}
        onClick={onOverlayClick}
      >
        {children}
      </div>
    </DrawerContainer>
  );
};

export const DrawerContainer = ({ children, containerId = "portals" }) => {
  const portalRef = useRef(null);

  if (!portalRef.current) {
    let el = document.getElementById(containerId);
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("id", containerId);
      document.body.appendChild(el);
    }
    portalRef.current = el;
  }

  return createPortal(children, portalRef.current);
};

PortalDrawer.propTypes = {
  overlayColor: PropTypes.string,
  placement: PropTypes.oneOf(["Left", "Right", "Top", "Bottom"]),
  onOutsideClick: PropTypes.func,
  zIndex: PropTypes.number,
  children: PropTypes.node.isRequired,
};

export default PortalDrawer;
