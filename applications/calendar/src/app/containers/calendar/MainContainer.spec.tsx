import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import createCache from '@proton/shared/lib/helpers/cache';
import { CacheProvider } from '@proton/components/containers/cache';
import useCalendars from '@proton/components/hooks/useCalendars';
import { CalendarDisplay, CALENDAR_TYPE } from '@proton/shared/lib/interfaces/calendar';
import { CALENDAR_FLAGS, MAX_LENGTHS_API } from '@proton/shared/lib/calendar/constants';
import ModalsProvider from '@proton/components/containers/modals/Provider';
import { ContactEmail } from '@proton/shared/lib/interfaces/contacts';

import MainContainer from './MainContainer';
import { useContactEmailsCache } from './ContactEmailsProvider';
import getSaveEventActions from './eventActions/getSaveEventActions';

jest.mock('./eventActions/getSaveEventActions', () => jest.fn());
jest.mock('@proton/components/hooks/useAddresses', () => ({
    __esModule: true,
    default: jest.fn(() => [
        [
            {
                Email: 'test@pm.gg',
                Status: 1,
                Receive: 1,
                Send: 1,
            },
        ],
    ]),
    useGetAddresses: jest.fn(),
}));
jest.mock('@proton/components/hooks/useGetCalendarBootstrap', () => ({
    __esModule: true,
    default: jest.fn(),
    useGetCalendarBootstrap: jest.fn(),
    useReadCalendarBootstrap: jest.fn(() => [
        {
            Keys: [
                {
                    ID: 'key1id',
                    PrivateKey: 'privateKey',
                    PassphraseID: 'passphraseID',
                    Flags: 3,
                    CalendarID: 'id3',
                },
            ],
            Passphrase: {
                Flags: 1,
                ID: 'passphraseId',
                MemberPassphrases: [
                    {
                        MemberID: 'memberId',
                        Passphrase: 'memberPassphrase',
                        Signature: 'memberSignature',
                    },
                ],
                CalendarID: 'id3',
            },
            Members: [
                {
                    ID: 'memberId',
                    Permissions: 127,
                    Email: 'test@pm.gg',
                    CalendarID: 'id3',
                    Color: '#f00',
                    Display: 1,
                },
            ],
            CalendarSettings: {
                ID: 'id3',
                CalendarID: 'id3',
                DefaultEventDuration: 30,
                DefaultPartDayNotifications: [
                    {
                        Type: 1,
                        Trigger: '-PT17M',
                    },
                    {
                        Type: 0,
                        Trigger: '-PT17M',
                    },
                ],
                DefaultFullDayNotifications: [
                    {
                        Type: 1,
                        Trigger: '-PT17H',
                    },
                    {
                        Type: 0,
                        Trigger: '-PT17H',
                    },
                ],
            },
        },
    ]),
    useCalendarBootstrap: jest.fn(() => [
        {
            Keys: [
                {
                    ID: 'key1id',
                    PrivateKey: 'privateKey',
                    PassphraseID: 'passphraseID',
                    Flags: 3,
                    CalendarID: 'id3',
                },
            ],
            Passphrase: {
                Flags: 1,
                ID: 'passphraseId',
                MemberPassphrases: [
                    {
                        MemberID: 'memberId',
                        Passphrase: 'memberPassphrase',
                        Signature: 'memberSignature',
                    },
                ],
                CalendarID: 'id3',
            },
            Members: [
                {
                    ID: 'memberId',
                    Permissions: 127,
                    Email: 'test@pm.gg',
                    CalendarID: 'id3',
                    Color: '#f00',
                    Display: 1,
                },
            ],
            CalendarSettings: {
                ID: 'id3',
                CalendarID: 'id3',
                DefaultEventDuration: 30,
                DefaultPartDayNotifications: [
                    {
                        Type: 1,
                        Trigger: '-PT17M',
                    },
                    {
                        Type: 0,
                        Trigger: '-PT17M',
                    },
                ],
                DefaultFullDayNotifications: [
                    {
                        Type: 1,
                        Trigger: '-PT17H',
                    },
                    {
                        Type: 0,
                        Trigger: '-PT17H',
                    },
                ],
            },
        },
    ]),
}));
jest.mock('@proton/components/hooks/useCalendarUserSettings', () => ({
    useGetCalendarUserSettings: jest.fn(),
    useCalendarUserSettings: jest.fn(() => [
        {
            DefaultCalendarID: 'id3',
            WeekLength: 7,
            DisplayWeekNumber: 1,
            AutoDetectPrimaryTimezone: 0,
            PrimaryTimezone: 'UTC',
            DisplaySecondaryTimezone: 0,
            ViewPreference: 1,
        },
    ]),
}));
jest.mock('@proton/components/helpers/appVersion', () => ({
    getAppVersion: () => 'appVersion',
}));
jest.mock('@proton/shared/lib/apps/slugHelper', () => ({
    getSlugFromApp: () => 'slugFromApp',
}));
jest.mock('@proton/shared/lib/apps/helper', () => ({
    getAppName: () => 'appName',
    getAppHrefBundle: () => 'appHrefBundle',
}));
jest.mock('@proton/components/hooks/useAuthentication', () => () => ({}));
jest.mock('@proton/components/hooks/useConfig', () => () => ({ APP_NAME: 'proton-calendar', APP_VERSION: 'test' }));
jest.mock('@proton/components/hooks/useSubscribedCalendars', () => () => ({}));
jest.mock('@proton/components/hooks/useContactEmails', () => () => []);
jest.mock('@proton/components/hooks/useFeature', () => () => ({}));
jest.mock('@proton/components/hooks/useNotifications', () => () => ({}));
jest.mock('@proton/components/hooks/useAppTitle', () => () => 'appTitle');
jest.mock('@proton/components/hooks/useWelcomeFlags', () => () => [{}]);
jest.mock('@proton/components/hooks/useCachedModelResult', () => () => [{}]);
jest.mock('@proton/components/hooks/useEventManager', () => () => ({}));
jest.mock('@proton/components/containers/eventManager/calendar/useCalendarsKeysSettingsListener', () => () => ({}));
jest.mock('@proton/components/containers/eventManager/calendar/ModelEventManagerProvider', () => ({
    useCalendarModelEventManager: () => {},
}));
jest.mock('./eventStore/useCalendarsEventsEventListener', () => () => ({}));
jest.mock('./ContactEmailsProvider', () => ({
    __esModule: true,
    useContactEmailsCache: jest.fn(() => ({
        contactEmails: [],
        contactGroups: [],
        contactEmailsMap: {},
        groupsWithContactsMap: {},
    })),
    default: ({ children }: any) => <>{children}</>,
}));
jest.mock('../../containers/alarms/useCalendarAlarmsEventListener', () => () => ({}));
jest.mock('@proton/components/hooks/useCalendars', () =>
    jest.fn(() => [
        [
            {
                ID: 'id1',
                Name: 'calendar1',
                Description: 'description1',
                Display: 1,
                Color: '#f00',
                Flags: 1, // CALENDAR_FLAGS.ACTIVE
                Type: 0, // CALENDAR_TYPE.PERSONAL
            },
        ],
    ])
);

function renderComponent() {
    return (
        <ModalsProvider>
            <Router history={createMemoryHistory()}>
                <CacheProvider cache={createCache()}>
                    <MainContainer />
                </CacheProvider>
            </Router>
        </ModalsProvider>
    );
}

const mockedUseCalendars = useCalendars as jest.Mock<ReturnType<typeof useCalendars>>;
const mockedUseContactEmailsCache = useContactEmailsCache as jest.Mock<ReturnType<typeof useContactEmailsCache>>;

const mockedCreatableCalendar = {
    ID: 'id3',
    Name: 'calendar3',
    Description: 'description3',
    Display: CalendarDisplay.VISIBLE,
    Color: '#f00',
    Flags: CALENDAR_FLAGS.ACTIVE,
    Type: CALENDAR_TYPE.PERSONAL,
};

describe('MainContainer', () => {
    const fakeNow = new Date(Date.UTC(2021, 0, 1, 0, 0, 0));

    beforeAll(() => {
        jest.useFakeTimers('modern').setSystemTime(fakeNow.getTime());
    });

    it(`should disable the new event button when there are no calendars, or they're all disabled or subscribed calendars`, async () => {
        const mockedNoCreateCalendars = [
            {
                ID: 'id1',
                Name: 'calendar1',
                Description: 'description1',
                Display: CalendarDisplay.HIDDEN,
                Color: '#f00',
                Flags: CALENDAR_FLAGS.INACTIVE,
                Type: CALENDAR_TYPE.PERSONAL,
            },
            {
                ID: 'id2',
                Name: 'calendar2',
                Description: 'description2',
                Display: CalendarDisplay.VISIBLE,
                Color: '#f00',
                Flags: CALENDAR_FLAGS.ACTIVE,
                Type: CALENDAR_TYPE.SUBSCRIPTION,
            },
        ];
        mockedUseCalendars.mockImplementation(() => [mockedNoCreateCalendars, false, undefined]);
        const { rerender } = render(renderComponent());

        expect(await screen.findByText(/New event/)).toBeDisabled();

        mockedUseCalendars.mockImplementation(() => [[], false, undefined]);
        rerender(renderComponent());

        expect(await screen.findByText(/New event/)).toBeDisabled();

        mockedUseCalendars.mockImplementation(() => [
            [...mockedNoCreateCalendars, mockedCreatableCalendar],
            false,
            undefined,
        ]);
        rerender(renderComponent());

        expect(await screen.findByText(/New event/)).not.toBeDisabled();
    });

    describe('Create event modal', () => {
        beforeEach(() => {
            mockedUseCalendars.mockImplementation(() => [[mockedCreatableCalendar], false, undefined]);
        });

        it('displays the correct fields when setting up recurring events', async () => {
            render(renderComponent());

            act(() => {
                fireEvent.click(screen.getByText(/New event/));
            });

            fireEvent.click(screen.getByTitle(/Select event frequency/));
            fireEvent.click(screen.getByTitle(/Custom/));

            expect(screen.getByTitle(/Choose how often this event repeats/)).toBeInTheDocument();

            const intervalButton = screen.getByTitle(/Select event frequency interval/);
            const endsButton = screen.getByTitle(/Select when this event will stop happening/);

            expect(intervalButton).toBeInTheDocument();
            expect(endsButton).toBeInTheDocument();
            expect(intervalButton.textContent).toBe('Week');
            expect(endsButton.textContent).toBe('Never');

            expect(screen.getByTitle(/Monday/)).toBeInTheDocument();
            expect(screen.getByTitle(/Tuesday/)).toBeInTheDocument();
            expect(screen.getByTitle(/Wednesday/)).toBeInTheDocument();
            expect(screen.getByTitle(/Thursday/)).toBeInTheDocument();
            expect(screen.getByTitle(/Friday/)).toBeInTheDocument();
            expect(screen.getByTitle(/Saturday/)).toBeInTheDocument();

            fireEvent.click(intervalButton);
            fireEvent.click(screen.getByTitle(/Day/));
            expect(screen.queryByTitle(/Monday/)).not.toBeInTheDocument();
            expect(screen.queryByTitle(/Tuesday/)).not.toBeInTheDocument();
            expect(screen.queryByTitle(/Wednesday/)).not.toBeInTheDocument();
            expect(screen.queryByTitle(/Thursday/)).not.toBeInTheDocument();
            expect(screen.queryByTitle(/Friday/)).not.toBeInTheDocument();
            expect(screen.queryByTitle(/Saturday/)).not.toBeInTheDocument();

            fireEvent.click(intervalButton);
            fireEvent.click(screen.getByTitle(/Year/));

            fireEvent.click(intervalButton);
            fireEvent.click(screen.getByTitle(/Month/));
            expect(screen.getByTitle(/Select a day in the month/)).toBeInTheDocument();

            fireEvent.click(endsButton);
            fireEvent.click(screen.getByText(/On date…/));
            expect(screen.getByTitle(/Select event's last date/)).toBeInTheDocument();

            fireEvent.click(endsButton);
            fireEvent.click(screen.getByText(/After repeating…/));
            expect(screen.getByTitle(/Choose how many times this event will repeat/)).toBeInTheDocument();
        });

        it('disables saving when there are over 100 participants and shows warnings', () => {
            const contactEmails = Array(101)
                .fill(1)
                .map((item, index) => ({
                    ID: `${index}`,
                    Name: `Test ${index}`,
                    Email: `test${index}@pm.you`,
                })) as ContactEmail[];
            // const group = {
            //     ID: 'group1',
            //     Name: 'group1',
            // } as ContactGroup;
            // const groupsWithContactsMap = {
            //     group1: {
            //         group,
            //         contacts: contactEmails,
            //     },
            // } as unknown as GroupsWithContactsMap;
            mockedUseContactEmailsCache.mockImplementation(() => ({
                contactEmails,
                contactGroups: [],
                contactEmailsMap: {},
                groupsWithContactsMap: {},
                contactEmailsMapWithDuplicates: {},
            }));

            render(renderComponent());

            act(() => {
                fireEvent.click(screen.getByText(/New event/));
            });

            const participantsInput = screen.getByTestId('participants-input') as HTMLInputElement;

            // Doesn't populate UI
            // userEvent.type(participantsInput, `group1`);
            // fireEvent.click(screen.getByTitle(`group1`));

            // userEvent.type(participantsInput, `u1@dd.co{enter}`);
            // fireEvent.blur(participantsInput);

            contactEmails.forEach(({ Email, Name }) => {
                userEvent.type(participantsInput, Email);
                fireEvent.click(screen.getByTitle(`${Name} <${Email}>`));
            });

            expect(screen.getByText(/At most 100 participants are allowed per invitation/)).toBeInTheDocument();
            expect(screen.getByText(/101 participants/)).toBeInTheDocument();
            expect(screen.getByText(/Save/)).toBeDisabled();

            userEvent.type(participantsInput, 'invalidEm@@@@.{enter}');
            const invalidEmailAddressWarning = screen.getByText(/Invalid email address/);

            expect(invalidEmailAddressWarning).toBeVisible();
            expect(invalidEmailAddressWarning).toBeInTheDocument();
        });

        it('validates inputs and submits', async () => {
            const contactEmails = Array(1)
                .fill(1)
                .map((item, index) => ({
                    ID: `${index}`,
                    Name: `Test ${index}`,
                    Email: `test${index}@pm.you`,
                })) as ContactEmail[];
            mockedUseContactEmailsCache.mockImplementation(() => ({
                contactEmails,
                contactGroups: [],
                contactEmailsMap: {},
                groupsWithContactsMap: {},
                contactEmailsMapWithDuplicates: {},
            }));

            render(renderComponent());

            act(() => {
                fireEvent.click(screen.getByText(/New event/));
            });

            const getRemoveNotification = () => screen.queryByText(/Remove this notification/);
            const getAddNotification = () => screen.getByText(/Add notification/);
            const notificationNumberInput = () => screen.getByTitle(/Choose a number/) as HTMLInputElement;
            const notificationDropdown = () =>
                screen.getByTitle(/Select when you want this notification to be sent/) as HTMLButtonElement;

            expect(notificationNumberInput().value).toBe('17');
            expect(notificationDropdown().textContent).toBe(`minutes before`);

            fireEvent.click(getRemoveNotification()!);

            expect(getRemoveNotification()).not.toBeInTheDocument();

            fireEvent.click(getAddNotification());

            expect(getRemoveNotification()).toBeInTheDocument();
            expect(notificationNumberInput().value).toBe('15');
            expect(notificationDropdown().textContent).toBe(`minutes before`);

            const descriptionTextarea = screen.getByTitle(
                /Add more information related to this event/
            ) as HTMLTextAreaElement;
            const titleInput = screen.queryByTitle(/Add event title/) as HTMLInputElement;
            const locationInput = screen.queryByTitle(/Add event location/) as HTMLInputElement;

            // Using paste since it is much faster
            userEvent.paste(titleInput, '1'.repeat(MAX_LENGTHS_API.TITLE + 2));
            userEvent.paste(descriptionTextarea, '1'.repeat(MAX_LENGTHS_API.EVENT_DESCRIPTION + 2));
            userEvent.paste(locationInput, '1'.repeat(MAX_LENGTHS_API.LOCATION + 2));

            expect(descriptionTextarea.value.length).toBe(MAX_LENGTHS_API.EVENT_DESCRIPTION);
            expect(titleInput.value.length).toBe(MAX_LENGTHS_API.TITLE);
            expect(locationInput.value.length).toBe(MAX_LENGTHS_API.LOCATION);

            // fireEvent.focus(screen.getByTitle(/Select event end date/));
            // const now = new Date();
            // const month = now.toLocaleString('default', { month: 'long' });
            // const year = now.getUTCFullYear();
            // const date = now.getUTCDate();
            // const todayRegex = new RegExp(`${month}\\s(${date})[a-zA-Z\\s,]+${year}`, 'g');
            // const yesterdayRegex = new RegExp(`${month}\\s(${date - 1})[a-zA-Z\\s,]+${year}`, 'g');
            //
            // // [0] is the sidebar minicalendar
            // expect(screen.queryAllByLabelText(todayRegex, { selector: 'button' })[1]).not.toBeDisabled();
            // expect(screen.queryAllByLabelText(yesterdayRegex, { selector: 'button' })[1]).toBeDisabled();

            const participantsInput = screen.getByTestId('participants-input') as HTMLInputElement;
            contactEmails.forEach(({ Email, Name }) => {
                userEvent.type(participantsInput, Email);
                fireEvent.click(screen.getByTitle(`${Name} <${Email}>`));
            });

            expect(screen.getByText(/1 participant/)).toBeInTheDocument();

            const saveButton = screen.getByText(/Save/);

            expect(saveButton).not.toBeDisabled();

            fireEvent.click(saveButton);

            expect(saveButton).toBeDisabled();
            expect(getSaveEventActions).toHaveBeenCalledWith({
                addresses: [{ Email: 'test@pm.gg', Receive: 1, Send: 1, Status: 1 }],
                api: undefined,
                getCalendarBootstrap: [
                    {
                        CalendarSettings: {
                            CalendarID: 'id3',
                            DefaultEventDuration: 30,
                            DefaultFullDayNotifications: [
                                { Trigger: '-PT17H', Type: 1 },
                                { Trigger: '-PT17H', Type: 0 },
                            ],
                            DefaultPartDayNotifications: [
                                { Trigger: '-PT17M', Type: 1 },
                                { Trigger: '-PT17M', Type: 0 },
                            ],
                            ID: 'id3',
                        },
                        Keys: [
                            {
                                CalendarID: 'id3',
                                Flags: 3,
                                ID: 'key1id',
                                PassphraseID: 'passphraseID',
                                PrivateKey: 'privateKey',
                            },
                        ],
                        Members: [
                            {
                                CalendarID: 'id3',
                                Color: '#f00',
                                Display: 1,
                                Email: 'test@pm.gg',
                                ID: 'memberId',
                                Permissions: 127,
                            },
                        ],
                        Passphrase: {
                            CalendarID: 'id3',
                            Flags: 1,
                            ID: 'passphraseId',
                            MemberPassphrases: [
                                {
                                    MemberID: 'memberId',
                                    Passphrase: 'memberPassphrase',
                                    Signature: 'memberSignature',
                                },
                            ],
                        },
                    },
                ],
                getCalendarKeys: expect.any(Function),
                getCanonicalEmailsMap: expect.any(Function),
                getEventDecrypted: expect.any(Function),
                handleSyncActions: expect.any(Function),
                inviteActions: { selfAddress: undefined, type: 4 },
                onDuplicateAttendees: expect.any(Function),
                onSaveConfirmation: expect.any(Function),
                onSendPrefsErrors: expect.any(Function),
                sendIcs: expect.any(Function),
                temporaryEvent: {
                    data: {
                        calendarData: {
                            Color: '#f00',
                            Description: 'description3',
                            Display: 1,
                            Flags: 1,
                            ID: 'id3',
                            Name: 'calendar3',
                            Type: 0,
                        },
                    },
                    end: new Date(Date.UTC(2021, 0, 1, 1, 0, 0)),
                    id: 'tmp',
                    isAllDay: false,
                    isAllPartDay: false,
                    isRecurring: false,
                    start: new Date(Date.UTC(2021, 0, 1, 0, 30, 0)),
                    tmpData: {
                        attendees: [
                            {
                                cn: 'test0@pm.you',
                                email: 'test0@pm.you',
                                partstat: 'NEEDS-ACTION',
                                role: 'REQ-PARTICIPANT',
                                rsvp: 'TRUE',
                            },
                        ],
                        calendar: { color: '#f00', id: 'id3', isSubscribed: false },
                        calendars: [{ color: '#f00', isSubscribed: false, text: 'calendar3', value: 'id3' }],
                        defaultEventDuration: 30,
                        defaultFullDayNotification: {
                            at: new Date(2000, 0, 1, 9, 0, 0),
                            id: '2',
                            isAllDay: true,
                            type: 1,
                            unit: 2,
                            value: 1,
                            when: '-',
                        },
                        defaultPartDayNotification: {
                            id: '1',
                            isAllDay: false,
                            type: 1,
                            unit: 4,
                            value: 15,
                            when: '-',
                        },
                        description:
                            '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
                        end: {
                            date: new Date(2021, 0, 1, 0, 0, 0),
                            time: new Date(2000, 0, 1, 1, 0, 0),
                            tzid: 'UTC',
                        },
                        frequencyModel: {
                            daily: { type: 0 },
                            ends: { count: 2, type: 'NEVER' },
                            frequency: 'WEEKLY',
                            interval: 1,
                            monthly: { type: 0 },
                            type: 'ONCE',
                            weekly: { days: [fakeNow.getUTCDay()], type: 0 },
                            yearly: { type: 0 },
                        },
                        fullDayNotifications: [
                            {
                                at: new Date(2000, 0, 1, 7, 0, 0),
                                id: expect.stringContaining('notification-'),
                                isAllDay: true,
                                type: 1,
                                unit: 2,
                                value: 1,
                                when: '-',
                            },
                        ],
                        hasTouchedNotifications: { fullDay: false, partDay: true },
                        hasTouchedRrule: false,
                        initialDate: new Date(Date.UTC(2021, 0, 1, 0, 0, 0)),
                        initialTzid: 'UTC',
                        isAllDay: false,
                        isOrganizer: true,
                        isProtonProtonInvite: false,
                        location:
                            '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
                        member: { addressID: undefined, memberID: 'memberId' },
                        partDayNotifications: [
                            {
                                id: expect.stringContaining('notification-'),
                                isAllDay: false,
                                type: 1,
                                unit: 4,
                                value: 15,
                                when: '-',
                            },
                        ],
                        start: {
                            date: new Date(2021, 0, 1, 0, 0, 0),
                            time: new Date(2000, 0, 1, 0, 30, 0),
                            tzid: 'UTC',
                        },
                        status: 'CONFIRMED',
                        title: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
                        type: 'event',
                        verificationStatus: 0,
                    },
                    tmpDataOriginal: {
                        attendees: [],
                        calendar: { color: '#f00', id: 'id3', isSubscribed: false },
                        calendars: [{ color: '#f00', isSubscribed: false, text: 'calendar3', value: 'id3' }],
                        defaultEventDuration: 30,
                        defaultFullDayNotification: {
                            at: new Date(2000, 0, 1, 9, 0, 0),
                            id: '2',
                            isAllDay: true,
                            type: 1,
                            unit: 2,
                            value: 1,
                            when: '-',
                        },
                        defaultPartDayNotification: {
                            id: '1',
                            isAllDay: false,
                            type: 1,
                            unit: 4,
                            value: 15,
                            when: '-',
                        },
                        description: '',
                        end: {
                            date: new Date(2021, 0, 1, 0, 0, 0),
                            time: new Date(2000, 0, 1, 1, 0, 0),
                            tzid: 'UTC',
                        },
                        frequencyModel: {
                            daily: { type: 0 },
                            ends: { count: 2, type: 'NEVER' },
                            frequency: 'WEEKLY',
                            interval: 1,
                            monthly: { type: 0 },
                            type: 'ONCE',
                            weekly: { days: [fakeNow.getUTCDay()], type: 0 },
                            yearly: { type: 0 },
                        },
                        fullDayNotifications: [
                            {
                                at: new Date(2000, 0, 1, 7, 0, 0),
                                id: expect.stringContaining('notification-'),
                                isAllDay: true,
                                type: 1,
                                unit: 2,
                                value: 1,
                                when: '-',
                            },
                        ],
                        hasTouchedNotifications: { fullDay: false, partDay: false },
                        hasTouchedRrule: false,
                        initialDate: new Date(Date.UTC(2021, 0, 1, 0, 0, 0)),
                        initialTzid: 'UTC',
                        isAllDay: false,
                        isOrganizer: true,
                        isProtonProtonInvite: false,
                        location: '',
                        member: { addressID: undefined, memberID: 'memberId' },
                        partDayNotifications: [
                            {
                                id: expect.stringContaining('notification-'),
                                isAllDay: false,
                                type: 1,
                                unit: 4,
                                value: 17,
                                when: '-',
                            },
                        ],
                        start: {
                            date: new Date(2021, 0, 1, 0, 0, 0),
                            time: new Date(2000, 0, 1, 0, 30, 0),
                            tzid: 'UTC',
                        },
                        status: 'CONFIRMED',
                        title: '',
                        type: 'event',
                        verificationStatus: 0,
                    },
                },
                weekStartsOn: 0,
            });
        });
    });
});
