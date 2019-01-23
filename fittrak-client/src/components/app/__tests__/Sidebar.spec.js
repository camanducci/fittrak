import { shallowMount } from "@vue/test-utils";

import Sidebar from "@/components/app/Sidebar";

describe("Sidebar", () => {
  test("Sidebar renders", () => {
    const component = shallowMount(Sidebar, {
      propsData: {
        viewer: {
          username: "Alice"
        }
      }
    });
    expect(component.html()).toMatchSnapshot();
  });
});
