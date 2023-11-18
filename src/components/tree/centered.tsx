import React, { PureComponent } from "react";

interface ICenteredState {
  translate: { [key: string]: number };
}

const withCentered = (WrappedComponent) => {
  return class extends PureComponent<any, any> {
    treeContainer: HTMLElement | null;
    constructor(props) {
      super(props);
      console.log("PROPS", props);
      this.state = {
        translateX: 0,
        translateY: 0,
      };
      this.treeContainer = null;
    }

    componentDidMount() {
      if (this.treeContainer) {
        console.log(this.treeContainer);
        const dimensions = this.treeContainer.getBoundingClientRect();

        console.log(
          "🚀 -------------------------------------------------------------------------------------🚀"
        );
        console.log(
          "🚀 ⚛︎ file: centered.tsx:19 ⚛︎ extends ⚛︎ componentDidMount ⚛︎ dimensions:",
          dimensions
        );
        console.log(
          "🚀 -------------------------------------------------------------------------------------🚀"
        );

        this.setState({
          translateX: dimensions.width / 2,
          translateY: dimensions.height / 2,
        });
      }
    }

    render() {
      return (
        <div
          ref={(tc) => (this.treeContainer = tc)}
          style={{ width: "100%", height: "80vh" }}
        >
          <WrappedComponent
            {...this.props}
            translate={{
              translateX: this.state.translateX,
              translateY: this.state.translateY,
            }}
          />
        </div>
      );
    }
  };
};

export default withCentered;
