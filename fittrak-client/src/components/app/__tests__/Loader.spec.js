import { shallowMount } from "@vue/test-utils";

import Loader from "@/components/app/Loader";

describe("Loader", () => {
  test("Loader renders", () => {
    const component = shallowMount(Loader, {
      propsData: {
        color: "red",
        size: "48"
      }
    });
    expect(component.html()).toMatchSnapshot();
  });
});
