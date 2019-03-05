import React from "react";
import { shallow } from "enzyme";
import SomeComponent from "../SomeComponent";

describe("SomeComponent", () => {
  it("says hello", () => {
    const wrapper = shallow(<SomeComponent />);
    expect(wrapper.text()).toMatch("Hello World");
  });
});
