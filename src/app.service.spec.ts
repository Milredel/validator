import { AppService } from "./app.service";


describe('AppService', () => {

    let appService: AppService;

    beforeEach(() => {
        appService = new AppService()
    })

    describe('buildErrorObject', () => {
        test('should return null if no error given', () => {
            const mockedBalanceErrors = [] as any;
            const mockedDuplicateErrors = {balances: [], movements: []} as any;
            const res = appService.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            expect(res).toBe(null);
        })

        test('should build reasons object with only balances if only balance errors', () => {
            const mockedBalanceErrors = [{some: 'balance error'}] as any;
            const mockedDuplicateErrors = {balances: [], movements: []} as any;
            const res = appService.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            expect(res).toStrictEqual({
                balances: [{some: 'balance error'}]
            });
        });

        it('should build reasons object with only duplicates if only duplicate errors', () => {
            const mockedBalanceErrors = [] as any;
            const mockedDuplicateErrors = {balances: [{some: 'duplicate balance'}], movements: [{some: 'duplicate movement'}]} as any;
            const res = appService.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            expect(res).toStrictEqual({
                duplicates: {
                    balances: [{some: 'duplicate balance'}],
                    movements: [{some: 'duplicate movement'}]
                }
            });
        });

        it('should build reasons object correctly', () => {
            const mockedBalanceErrors = [{some: 'balance error'}] as any;
            const mockedDuplicateErrors = {balances: [{some: 'duplicate balance'}], movements: [{some: 'duplicate movement'}]} as any;
            const res = appService.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            expect(res).toStrictEqual({
                balances: [{some: 'balance error'}],
                duplicates: {
                    balances: [{some: 'duplicate balance'}],
                    movements: [{some: 'duplicate movement'}]
                }
            });
        });
    })

    describe('checkForErrors', () => {
        test('should detect balance errors correctly', () => {
            const mockedData = [
                {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 50},
                {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20},
                {"date": "2023-01-24 00:00:00", "balance": 60}
            ];
            const res = appService.checkForErrors(mockedData);
            expect(res).toStrictEqual({
                "balances": [
                    {
                        "start": null,
                        "end": {"date": "2023-01-24 00:00:00", "balance": 60},
                        "diff": {
                            "expected": 60,
                            "computed": 80,
                            "delta": -20
                        },
                        "movements": [
                            {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                            {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 50},
                            {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20}
                        ]
                    }
                ]
            });
        });

        test('should detect duplicate errors correctly', () => {
            const mockedData = [
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30, "isDuplicate": true},
                {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20},
                {"date": "2023-01-26 00:00:00", "balance": 60},
                {"date": "2023-01-26 00:00:00", "balance": 60, "isDuplicate": true}
            ];
            const res = appService.checkForErrors(mockedData);
            expect(res).toStrictEqual({
                "balances": [
                    {
                        "start": null,
                        "end": {"date": "2023-01-26 00:00:00", "balance": 60},
                        "diff": {
                            "expected": 60,
                            "computed": 90,
                            "delta": -30
                        },
                        "movements": [
                            {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                            {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                            {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                            {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20},
                        ]
                    },
                    {
                        "start": {"date": "2023-01-26 00:00:00", "balance": 60},
                        "end": {"date": "2023-01-26 00:00:00", "balance": 60},
                        "diff": {
                            "expected": 60,
                            "computed": 0,
                            "delta": 60
                        },
                        "movements": []
                    }
                ],
                "duplicates": {
                    "movements": [
                        {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30}
                    ],
                    "balances": [
                        {"date": "2023-01-26 00:00:00", "balance": 60}
                    ]
                }
            });
        });
    })

    describe('flagDuplicates', () => {
        test('should flag duplicates correctly', () => {
            const mockedData = [
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 50},
                {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20},
                {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20},
                {"date": "2023-01-24 00:00:00", "balance": 60},
                {"date": "2023-01-26 00:00:00", "balance": 60},
                {"date": "2023-01-26 00:00:00", "balance": 60}
            ];
            const res = appService.flagDuplicates(mockedData);
            expect(res).toStrictEqual([
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 50},
                {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20},
                {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30, "isDuplicate": true},
                {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20},
                {"date": "2023-01-24 00:00:00", "balance": 60},
                {"date": "2023-01-26 00:00:00", "balance": 60},
                {"date": "2023-01-26 00:00:00", "balance": 60, "isDuplicate": true}
            ]);
        });
    });

    describe('mergeAndSortData', () => {
        test('should merge and sort correctly', () => {
            const mockedData = {
                "movements": [
                    {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                    {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 30},
                    {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20},
                    {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                    {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                    {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20}
                ],
                "balances": [
                    {"date": "2023-01-24 00:00:00", "balance": 60},
                    {"date": "2023-01-26 00:00:00", "balance": 60}
                ]
            };
            const res = appService.mergeAndSortData(mockedData);
            expect(res).toStrictEqual([
                {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20},
                {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 30},
                {"date": "2023-01-24 00:00:00", "balance": 60},
                {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20},
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                {"date": "2023-01-26 00:00:00", "balance": 60}
            ]);
        });
    });

    describe('validate', () => {
        test('should return correct info if everything is ok', () => {
            const contentOK = appService.getContentFromFile('payload-ok.json', 'test')
            const res = appService.validate(contentOK);
            expect(res).toStrictEqual({
                mergedData: [
                    {amount: 10, date: "2023-01-23 10:00:00", id: 1, label: "First movement"},
                    {amount: 20, date: "2023-01-23 10:05:00", id: 2, label: "Second movement"},
                    {amount: 30, date: "2023-01-23 10:10:00", id: 3, label: "Third movement"},
                    {balance: 60, date: "2023-01-24 00:00:00"},
                    {amount: 10, date: "2023-01-24 10:00:00", id: 4, label: "Fourth movement"},
                    {amount: 20, date: "2023-01-25 10:05:00", id: 6, label: "Sixth movement"},
                    {amount: 30, date: "2023-01-25 10:10:00", id: 5, label: "Fifth movement"},
                    {balance: 60, date: "2023-01-26 00:00:00"}
                ],
                reasons: null, 
                result: "ok"
            })
        });

        test('should return correct info if it is ko', () => {
            const contentOK = appService.getContentFromFile('payload-ko.json', 'test')
            const res = appService.validate(contentOK);
            expect(res).toStrictEqual({
                mergedData: [
                    {amount: 10, date: "2023-01-23 10:00:00", id: 1, label: "First movement"},
                    {amount: 20, date: "2023-01-23 10:05:00", id: 2, label: "Second movement"},
                    {amount: 50, date: "2023-01-23 10:10:00", id: 3, label: "Third movement"},
                    {balance: 60, date: "2023-01-24 00:00:00"},
                    {amount: 10, date: "2023-01-24 10:00:00", id: 4, label: "Fourth movement"},
                    {amount: 20, date: "2023-01-25 10:05:00", id: 6, label: "Sixth movement"},
                    {amount: 30, date: "2023-01-25 10:10:00", id: 5, label: "Fifth movement"},
                    {amount: 30, date: "2023-01-25 10:10:00", id: 5, label: "Fifth movement"},
                    {balance: 60, date: "2023-01-26 00:00:00"},
                    {balance: 60, date: "2023-01-26 00:00:00"}
                ],
                reasons: {
                    balances: [
                        {
                            start: null,
                            end: {date: "2023-01-24 00:00:00", balance: 60},
                            diff: {expected: 60, computed: 80, delta: -20},
                            movements: [
                                {id: 1, date: "2023-01-23 10:00:00", label: "First movement", amount: 10},
                                {id: 2, date: "2023-01-23 10:05:00", label: "Second movement", amount: 20},
                                {id: 3, date: "2023-01-23 10:10:00", label: "Third movement", amount: 50}
                            ]
                        },
                        {
                            start: {date: "2023-01-24 00:00:00", balance: 60},
                            end: {date: "2023-01-26 00:00:00", balance: 60},
                            diff: {expected: 60, computed: 90, delta: -30},
                            movements: [
                                {id: 4, date: "2023-01-24 10:00:00", label: "Fourth movement", amount: 10},
                                {id: 6, date: "2023-01-25 10:05:00", label: "Sixth movement", amount: 20},
                                {id: 5, date: "2023-01-25 10:10:00", label: "Fifth movement", amount: 30},
                                {id: 5, date: "2023-01-25 10:10:00", label: "Fifth movement", amount: 30}
                            ]
                        },
                        {
                            start: {date: "2023-01-26 00:00:00", balance: 60},
                            end: {date: "2023-01-26 00:00:00", balance: 60},
                            diff: {expected: 60, computed: 0, delta: 60},
                            movements: []
                        }
                    ],
                    duplicates: {
                        movements: [
                            {id: 5, date: "2023-01-25 10:10:00", label: "Fifth movement", amount: 30}
                        ],
                        balances: [
                            {date: "2023-01-26 00:00:00", balance: 60}
                        ]
                    }
                }, 
                result: "ok"
            })
        });
    });
})