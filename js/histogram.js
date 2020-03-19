class Histogram {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1300,
      containerHeight: _config.containerHeight || 420
    };
    this.config.margin = _config.margin || {
      top: 10,
      bottom: 45,
      right: 10,
      left: 30
    };
    this.initVis();
  }

  initVis() {}

  update() {}

  render() {}
}