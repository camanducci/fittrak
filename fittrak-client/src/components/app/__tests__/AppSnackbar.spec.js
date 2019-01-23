import { shallowMount } from "@vue/test-utils";

import AppSnackbar from "@/components/app/AppSnackbar";

describe("AppSnackbar", () => {
  test("AppSnackbar renders", () => {
    const component = shallowMount(AppSnackbar);
    expect(component.html()).toMatchSnapshot();
  });
});
