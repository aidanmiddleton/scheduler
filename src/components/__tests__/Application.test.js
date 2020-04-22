import React from "react";
import axios from "axios"
import { getByText, prettyDOM, getByAltText, queryByAltText, getByPlaceholderText, getAllByTestId, queryByText } from "@testing-library/react"
import { render, cleanup, waitForElement, fireEvent } from "@testing-library/react";
import Application from "../../components/Application";

afterEach(cleanup);

describe("Application", () => {

  it("changes the schedule when a new day is selected", async () => {
    const { getByText } = render(<Application />);

    await waitForElement(() => getByText("Monday"));
    fireEvent.click(getByText("Tuesday"));
    await waitForElement(() => getByText("Leopold Silvers"))

    expect(getByText("Leopold Silvers")).toBeInTheDocument();

    
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container, debug } = render(<Application />);

    await waitForElement(() => getByText(container, "Archie Cohen"));

    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];

    fireEvent.click(getByAltText(appointment, "Add"));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });

    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    fireEvent.click(getByText(appointment, "Save"));

    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));

    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );

    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });


  it('loads data, cancels an interview and increases the spots remaining for Monday by 1', async () => {
    // 1. Render the Application.
    const { container } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, 'Archie Cohen'));
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(
      container,
      'appointment'
    ).find(appointment => queryByText(appointment, 'Archie Cohen'));
    fireEvent.click(queryByAltText(appointment, 'Delete'));

    // 4. Check that the confirmation message is shown.
    setTimeout(async () => {
      expect(
        getByText(appointment, 'Are you sure you would like to delete?')
      ).toBeInTheDocument();
      await waitForElement(() =>
        getByText(appointment, 'Are you sure you would like to delete?')
      );
    }, 1000);

    // 5. Click the "Confirm" button on the confirmation.
    fireEvent.click(queryByText(appointment, 'Confirm'));

    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, 'Deleting')).toBeInTheDocument();

    // 7. Wait until the element with the "Add" button is displayed.
    await waitForElement(() => getByAltText(appointment, 'Add'));

    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, 'day').find(day =>
      queryByText(day, 'Monday')
    );
    setTimeout(async () => {
      expect(getByText(day, '5 spots remaining')).toBeInTheDocument();
      await waitForElement(() => getByText(day, '5 spots remaining'));
    }, 1000);
  });

  it('loads data, edits an interview and keeps the spots remaining for Monday the same', async () => {
    const { container, debug } = render(<Application />);
    await waitForElement(() => getByText(container, 'Archie Cohen'));
    const appointments = getAllByTestId(container, 'appointment');
    const appointment = appointments[0];
    fireEvent.click(getByAltText(appointment, 'Add'));
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: 'Lydia Miller-Jones' }
    });
    debug();
    fireEvent.click(getByAltText(appointment, 'Sylvia Palmer'));
    fireEvent.click(getByText(appointment, 'Save'));
  });

  it('shows the save error when failing to save an appointment', async () => {
    axios.put.mockRejectedValueOnce();
    const { container, debug } = render(<Application />);
    await waitForElement(() => getByText(container, 'Archie Cohen'));
    const appointment = getAllByTestId(
      container,
      'appointment'
    ).find((appointment) => getByAltText(appointment, 'Add'));
    const days = getAllByTestId(container, 'day');
    const day = days.find((day) => queryByText(day, 'Monday'));
    fireEvent.click(getByAltText(appointment, 'Add'));

    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: 'Lydia Miller-Jones' },
    });
    fireEvent.click(getByAltText(appointment, 'Sylvia Palmer'));

    fireEvent.click(getByText(appointment, 'Save'));
    await waitForElement(() =>
      getByText(container, 'Error Saving Appointment')
    );
    expect(
      getByText(container, 'Error Saving Appointment')
    ).toBeInTheDocument();
  });
  
  it('shows the delete error when failing to delete an existing appointment', async () => {
    axios.delete.mockRejectedValueOnce();
    const { container, debug } = render(<Application />);

    await waitForElement(() => getByText(container, 'Archie Cohen'));
    const appointment = getAllByTestId(
      container,
      'appointment'
    ).find((appointment) => queryByText(appointment, 'Archie Cohen'));
    const days = getAllByTestId(container, 'day');
    const day = days.find((day) => queryByText(day, 'Monday'));
    fireEvent.click(queryByAltText(appointment, 'Delete'));
    expect(
      getByText(appointment, 'Are you sure you would like to delete?')
    ).toBeInTheDocument();
    fireEvent.click(queryByText(appointment, 'Confirm'));
    expect(getByText(appointment, 'Deleting')).toBeInTheDocument();
    await waitForElement(() =>
      getByText(container, 'Error Deleting Appointment')
    );
  });

});
