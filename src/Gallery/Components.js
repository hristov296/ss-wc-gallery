import { css } from "@emotion/core";

export const carouselArrow = (props) => css`
  position: absolute;
  left: calc(50% - 15px);
  transform: translateX(-50%);
  fill: #333;
  width: 50px;
  cursor: pointer;
  ${props.dir === "up" ? "top: -40px;" : "bottom: -40px;"}
  opacity: 1;
  transition: opacity 0.3s;
  &.inactive {
    opacity: 0.3;
  }
`;

export const carouselContent = css`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow: hidden;
  position: relative;
  user-select: none;
  height: 100%;
`;

export const galStyles = css`
  display: flex;
  align-items: center;
  .gallery-thumbs-wrap {
    position: relative;
  }
  .gal-thumb {
    display: flex;
    /* margin-bottom: 10px; */
    user-select: none;
    cursor: pointer;
    img {
      user-drag: none;
    }
  }
  .gallery-main-wrap {
    position: relative;
    flex: 1;
  }
  .gallery-main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    font-size: 0;
    overflow: hidden;
  }
  .gallery-main-cont {
    .gallery-single-slide {
      display: flex;
      a {
        display: flex;
        width: 100%;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
  &.slider-inactive {
    .gal-thumb {
      margin-bottom: 12px;
    }
  }
`;

export const galleryMainWrap = (sizes) => css`
  width: ${sizes["width"]}px;
  height: ${sizes["height"]}px;
`;

export const galleryThumbs = (sizes) => css`
  /* width: ${sizes["width"]}px; */
  height: ${sizes["height"] - 100}px;
  flex: 1;
  margin-right: 30px;
  overflow: hidden;
`;
