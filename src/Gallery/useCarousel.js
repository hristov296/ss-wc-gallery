import { useEffect, useState, useReducer, useMemo, useRef } from "react";
import { useSwipeable } from "./reactSwipeable";
import { useWindowSize } from "./useWindowSize";

const transitionTime = 400;
const limit = 0.9;
// const elastic = `transform ${transitionTime}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
const smooth = `transform ${transitionTime}ms ease`;

function carouselReducer(state, action) {
  switch (action.type) {
    case "reset":
      return {
        ...state,
        active: 0,
      };
    case "updateMax":
      return {
        ...state,
        max: action.length,
        showing: action.slidesToShow,
      };
    case "jump":
      return {
        ...state,
        transition: smooth,
        pointerEvents: "all",
        offset: 0,
        active: Math.min(Math.max(action.desired + state.active, 0), state.max - state.showing),
      };
    case "jumpinf":
      return {
        ...state,
        transition: smooth,
        pointerEvents: "all",
        offset: 0,
        active: Math.min(Math.max(action.desired + state.active, -1), state.max - state.showing + 1),
      };
    case "jumpto":
      return {
        ...state,
        transition: "initial",
        pointerEvents: "all",
        offset: 0,
        active: action.active,
      };
    case "next":
      return {
        ...state,
        transition: smooth,
        pointerEvents: "all",
        offset: 0,
        active: state.active + 1 === state.max ? 0 : state.active + 1,
      };
    case "done":
      return {
        ...state,
        offset: 0,
        pointerEvents: "all",
        active: state.desired,
      };
    case "drag":
      return {
        ...state,
        transition: "initial",
        pointerEvents: "none",
        offset: action.offset,
      };
    default:
      return state;
  }
}

export function useCarousel(props, playing) {
  const [container, setContainer] = useState(undefined);
  const [isAnimating, setAnimating] = useState(false);
  const windowWidth = useWindowSize().width;
  const responsiveProps = useRef({});
  const { responsive = [] } = props;

  useEffect(() => {
    let tempOptions = responsive.reverse().find((el) => windowWidth < el.breakpoint);
    responsiveProps.current = tempOptions ? tempOptions.options : {};
  }, [windowWidth, responsive]);

  const {
    length = 0,
    interval = 3000,
    slidesToShow = 1,
    margin = 0,
    centeredMode = false,
    allowSwiping = false,
    infinite = true,
    fade = false,
    keepSlideWidth = false,
    initialSlideWidth = 200,
    sens = 1,
    direction = "horizontal",
  } = Object.assign({}, props, responsiveProps.current);

  const [state, dispatch] = useReducer(carouselReducer, {
    offset: 0,
    desired: 0,
    active: 0,
    transition: "initial",
    pointerEvents: "all",
    max: length,
    showing: slidesToShow,
  });

  useEffect(() => {
    dispatch({
      type: "updateMax",
      length,
      slidesToShow,
    });
  }, [length, slidesToShow]);

  const slideWidth = useMemo(() => {
    return container
      ? keepSlideWidth
        ? initialSlideWidth
        : ((direction === "vertical"
            ? container.parentElement.clientHeight
            : container.parentElement.clientWidth) -
            margin * (slidesToShow - 1)) /
          slidesToShow
      : null;
  }, [container, margin, slidesToShow, windowWidth]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ I need to re-trigger on windowWidth change

  const marginSize = useMemo(() => {
    if (container && keepSlideWidth) {
      if (direction === "vertical") {
        return (container.parentElement.clientHeight - slideWidth * slidesToShow) / (slidesToShow - 1);
      } else {
        return (container.parentElement.clientWidth - slideWidth * slidesToShow) / (slidesToShow - 1);
      }
    } else {
      return margin;
    }
  }, [
    margin,
    container,
    keepSlideWidth,
    slidesToShow,
    slideWidth,
    windowWidth, // eslint-disable-line react-hooks/exhaustive-deps
  ]);

  const start = useMemo(() => {
    return infinite ? 0 - slidesToShow * (slideWidth + marginSize) : 0;
  }, [infinite, slidesToShow, slideWidth, marginSize]);

  const slideStyle = useMemo(() => {
    const style = {
      marginLeft: 0,
    };
    if (direction === "vertical") {
      style.marginBottom = `${marginSize}px`;
      style.height = `${slideWidth}px`;
    } else {
      style.marginRight = `${marginSize}px`;
      style.width = `${slideWidth}px`;
    }
    if (fade) {
      style.position = "absolute";
      style.left = 0;
    }
    return style;
  }, [slideWidth, marginSize, fade]);

  const swipeableProps = {
    // onSwiping(e) {
    //   if (isAnimating) return;
    //   // document.documentElement.classList.add("swiping");
    //   const sign = e.deltaX > 0 ? -1 : 1;
    //   const offset =
    //     sign < 0
    //       ? sign *
    //         Math.min(
    //           Math.abs(e.deltaX),
    //           limit * slideWidth +
    //             (length - state.showing - state.active) *
    //               (slideWidth + marginSize)
    //         )
    //       : sign *
    //         Math.min(
    //           Math.abs(e.deltaX),
    //           limit * slideWidth + state.active * (slideWidth + marginSize)
    //         );

    //   if (!fade) {
    //     dispatch({
    //       type: "drag",
    //       offset,
    //     });
    //   }
    // },
    onSwiping(e) {
      if (e.event.cancelable) {
        // console.log(e.event.cancelable);
      }
      // e.event.preventDefault();
    },
    onSwiped(e) {
      // if (isAnimating) return;
      // document.documentElement.classList.remove("swiping");
      if ((e.dir === "Up" || e.dir === "Down") && direction !== "vertical") {
        return;
      }

      if ((e.dir === "Left" || e.dir === "Right") && direction === "vertical") {
        return;
      }

      const rightDelta = direction === "vertical" ? e.deltaY : e.deltaX;

      setAnimating(true);
      setTimeout(() => {
        setAnimating(false);
      }, transitionTime - 50);

      const sign = rightDelta > 0 ? 1 : -1;
      const desired = Math.round(
        (sign *
          Math.min(
            Math.abs(
              rightDelta * Math.max(e.velocity, 1) * sens
              //  * 0.65
            ),
            (state.showing - 0.45) * state.showing * (slideWidth + marginSize)
          )) /
          (slideWidth + marginSize)
        //  * 2.5 *  Math.pow(0.63, slidesToShow - 1)
      );
      // min of: current delta by velocity reduced by some other constant'
      // or a ratio equal to arithmetic progression of -0.5 + number of slidesToShow
      // by single slide width by number of slides to show.
      // then the sign is added
      // then divided by single slide width
      // multiplied by the ratio of geometric progresion equal to
      // a1 = 2.5 and r = 0.63
      // console.log(
      //   sign,
      //   Math.abs(
      //     rightDelta * Math.max(e.velocity, 1) * sens
      //     //  * 0.65
      //   ),
      //   e.velocity,
      //   (slidesToShow - 0.45) * slidesToShow * (slideWidth + marginSize),
      //   slideWidth + marginSize
      // );

      dispatch({
        type: infinite ? "jumpinf" : "jump",
        desired,
      });
    },
    trackMouse: true,
    trackTouch: true,
    preventDefaultTouchmoveEvent: true,
  };

  if (allowSwiping) {
    swipeableProps.onSwiping = (e) => {
      if (isAnimating) return;
      // document.documentElement.classList.add("swiping");
      const rightDelta = direction === "vertical" ? e.deltaY : e.deltaX;
      const sign = rightDelta > 0 ? -1 : 1;
      const offset =
        sign < 0
          ? sign *
            Math.min(
              Math.abs(rightDelta),
              limit * slideWidth + (length - state.showing - state.active) * (slideWidth + marginSize)
            )
          : sign *
            Math.min(
              Math.abs(rightDelta),
              limit * slideWidth + state.active * (slideWidth + marginSize)
            );

      if (!fade) {
        dispatch({
          type: "drag",
          offset,
        });
      }
    };
  }

  const { ref, onMouseDown } = useSwipeable(swipeableProps);

  const handlers = {
    onMouseDown,
    onDragStart: (e) => e.preventDefault(),
    ref(container) {
      setContainer(container);
      return ref(container);
    },
  };

  useEffect(() => {
    let id;

    if (playing) {
      id = setTimeout(() => dispatch({ type: "next" }), interval);
    }
    return () => clearTimeout(id);
  }, [playing, interval, state.active]);

  useEffect(() => {
    dispatch({
      type: "jumpto",
      active: 0,
    });
  }, [windowWidth]);

  useEffect(() => {
    if (state.active === -1) {
      setTimeout(
        () =>
          dispatch({
            type: "jumpto",
            active: length - 1,
          }),
        transitionTime
      );
    } else if (state.active === length) {
      setTimeout(
        () =>
          dispatch({
            type: "jumpto",
            active: 0,
          }),
        transitionTime
      );
    }
  }, [state.active, length]);

  const activeIndex = () => {
    if (state.active > length - 1) {
      return state.active - length;
    } else if (state.active < 0) {
      return length + state.active;
    } else {
      return state.active;
    }
  };

  return {
    reset: () => {
      return dispatch({
        type: "reset",
      });
    },
    sliderActive: length > slidesToShow,
    maxSlide: length - slidesToShow,
    active: activeIndex(),
    setActive: (n) =>
      dispatch({
        type: infinite ? "jumpinf" : "jump",
        desired: n - state.active,
      }),
    handlers: length > slidesToShow ? handlers : {},
    currShownSlides: slidesToShow,
    style:
      length > slidesToShow
        ? {
            transform: fade
              ? "none"
              : direction === "vertical"
              ? `translateY(${start - state.active * (slideWidth + marginSize) + state.offset}px)`
              : `translateX(${start - state.active * (slideWidth + marginSize) + state.offset}px)`,
            transition: state.transition,
            pointerEvents: state.pointerEvents,
            width: fade ? "100%" : "",
            display: "inline-flex",
            flexFlow: direction === "vertical" ? "column" : "row",
          }
        : {},
    slideStyle: length > slidesToShow ? slideStyle : {},
    dotsLength: length - slidesToShow + 1,
  };
}
