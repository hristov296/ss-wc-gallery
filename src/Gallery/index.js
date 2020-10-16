/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import { useCarousel } from "./useCarousel";
import { useWindowSize } from "./useWindowSize";

import { carouselContent, galleryMainWrap, galleryThumbs, galStyles, carouselArrow } from "./Components";

const Gallery = (props) => {
  const { data } = props;
  const currLength = useRef(data["thumb_images"].length);
  // const [slideOptions, setSlideOptions] = useState({});
  const [currId, setCurrId] = useState(0);
  const [currVariation, setVariation] = useState(0);
  const windowWidth = useWindowSize().width;

  const { active, setActive, handlers, style, slideStyle } = useCarousel(
    { length: currLength.current, interval: 300000, infinite: false, sens: 4 },
    false
  );

  const isVariable = "variations" in data;

  const {
    reset,
    sliderActive,
    maxSlide,
    active: activeThumb,
    setActive: setActiveThumb,
    currShownSlides,
    handlers: handlersThumb,
    style: styleThumb,
    slideStyle: slideStyleThumb,
  } = useCarousel(
    {
      slidesToShow: 4,
      length: currLength.current,
      margin: 0,
      infinite: false,
      allowSwiping: true,
      direction: "vertical",
      keepSlideWidth: true,
      initialSlideWidth: 80,
    },
    false
  );

  const onClickProdThumb = (e, index) => {
    if (activeThumb === maxSlide) {
      if (activeThumb === index) {
        setActiveThumb(activeThumb - 1);
      }
    } else if (activeThumb === 0) {
      if (index === currShownSlides - 1) {
        setActiveThumb(activeThumb + 1);
      }
    } else {
      if (index === currShownSlides - 1 + activeThumb) {
        setActiveThumb(activeThumb + 1);
      } else if (index === activeThumb) {
        setActiveThumb(activeThumb - 1);
      }
    }

    setActive(index);
    setCurrId(index);
  };

  const onClickArrow = (dir) => {
    if (dir === "up") {
      activeThumb > 0 && setActiveThumb(activeThumb - 1);
    } else {
      activeThumb < currLength.current - 1 && setActiveThumb(activeThumb + 1);
    }
  };

  useEffect(() => {
    if (activeThumb === maxSlide) {
      if (activeThumb === active) {
        setActiveThumb(activeThumb - 1);
      }
    } else if (activeThumb === 0) {
      if (active === currShownSlides - 1) {
        setActiveThumb(activeThumb + 1);
      }
    } else {
      if (active === currShownSlides - 1 + activeThumb) {
        setActiveThumb(activeThumb + 1);
      } else if (active === activeThumb) {
        setActiveThumb(activeThumb - 1);
      }
    }
    setActive(active);
    setCurrId(active);
  }, [active]);

  useEffect(() => {
    if (!isVariable) {
      return;
    }
    const form = document.querySelector(".variations_form");
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(function (mutation) {
        if (mutation.type == "attributes" && mutation.attributeName === "current-image") {
          const currImage = mutation.target.getAttribute("current-image");
          if (currImage) {
            setVariation(currImage);
          } else {
            setVariation(0);
          }
          setActive(0);
          reset();
        }
      });
    });

    observer.observe(form, {
      attributes: true,
      childList: false,
      subtree: false,
    });

    return () => {
      observer.disconnect();
    };
  }, [setActive, reset]);

  return (
    <div
      className={classnames([
        "gallery-wrap",
        {
          "slider-active": sliderActive,
          "slider-inactive": !sliderActive,
          "mobile-slider": windowWidth <= 600,
        },
      ])}
      css={galStyles}>
      {windowWidth > 600 ? (
        <div className="gallery-thumbs-wrap">
          {sliderActive && (
            <>
              <svg
                className={classnames(["icon", "ch-up", { inactive: activeThumb === 0 }])}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 448 448"
                onClick={() => onClickArrow("up")}
                css={carouselArrow({ dir: "up" })}>
                <path d="M420.75 332.75L379.25 374a15.844 15.844 0 01-22.5 0L224 241.25 91.25 374a15.844 15.844 0 01-22.5 0l-41.5-41.25c-6.25-6.25-6.25-16.5 0-22.75l185.5-185.25a15.844 15.844 0 0122.5 0L420.75 310c6.25 6.25 6.25 16.5 0 22.75z" />
              </svg>
              <svg
                className={classnames(["icon", "ch-down", { inactive: activeThumb === maxSlide }])}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 448 448"
                onClick={() => onClickArrow("down")}
                css={carouselArrow({ dir: "down" })}>
                <path d="M420.75 202l-185.5 185.25a15.844 15.844 0 01-22.5 0L27.25 202c-6.25-6.25-6.25-16.5 0-22.75L68.75 138a15.844 15.844 0 0122.5 0L224 270.75 356.75 138a15.844 15.844 0 0122.5 0l41.5 41.25c6.25 6.25 6.25 16.5 0 22.75z" />
              </svg>
            </>
          )}
          <div className="gallery-thumbs" css={galleryThumbs(data["woocommerce_single"])}>
            <div className="gallery-thumbs-cont" {...handlersThumb} style={styleThumb}>
              {data["thumb_images"].map((el, i) => {
                const currVariationItem =
                  currVariation > 0 ? data.variations.find((el) => el.id == currVariation) : {};
                const currAtts = {
                  src: currVariation > 0 && i === 0 ? currVariationItem.src_thumb[0] : el[0],
                  width: currVariation > 0 && i === 0 ? currVariationItem.src_thumb[1] : el[1],
                  height: currVariation > 0 && i === 0 ? currVariationItem.src_thumb[2] : el[2],
                };
                return (
                  <div
                    key={i}
                    className={classnames("gal-thumb", { active: currId === i })}
                    onClick={(e) => onClickProdThumb(e, i)}
                    style={slideStyleThumb}>
                    <img src={currAtts.src} width={currAtts.width} height={currAtts.height} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="gallery-mobile-thumbs">
          {[...Array(currLength.current)].map((el, i) => (
            <div
              className={classnames(["mobile-gal-thumb", { active: i === currId }])}
              key={i}
              onClick={() => {
                setActive(i);
                setCurrId(i);
              }}></div>
          ))}
        </div>
      )}
      <div className="gallery-main-styled">
        <div className="gallery-main-wrap" css={galleryMainWrap(data["woocommerce_single"])}>
          <div className="gallery-main">
            <div className="gallery-main-cont" css={carouselContent} {...handlers} style={style}>
              {data["single_images"].map((el, i) => {
                const currVariationItem =
                  currVariation > 0 ? data.variations.find((el) => el.id == currVariation) : {};
                const currAtts = {
                  src: currVariation > 0 && i === 0 ? currVariationItem.src_single[0] : el[0],
                  width: currVariation > 0 && i === 0 ? currVariationItem.src_single[1] : el[1],
                  height: currVariation > 0 && i === 0 ? currVariationItem.src_single[2] : el[2],
                  widthFull:
                    currVariation > 0 && i === 0
                      ? currVariationItem.src_full[1]
                      : data["full_images"][i][1],
                  heightFull:
                    currVariation > 0 && i === 0
                      ? currVariationItem.src_full[2]
                      : data["full_images"][i][2],
                  url:
                    currVariation > 0 && i === 0
                      ? currVariationItem.src_full[0]
                      : data["full_images"][i][0],
                };
                return (
                  <div key={i} style={slideStyle} className="gallery-single-slide">
                    <a
                      href={currAtts.url}
                      data-lbwps-width={currAtts.widthFull}
                      data-lbwps-height={currAtts.heightFull}
                      // data-lbwps-handler="1"
                    >
                      <img src={currAtts.src} width={currAtts.width} height={currAtts.height} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(
  <Gallery data={window.ss_wc_gallery} />,
  document.getElementById("ss-woocommerce-gallery")
);
