import { AppService } from './app.service';
import { expect, stub, stubClass } from './test';

describe('AppService', () => {
    let service: AppService;

    beforeEach(() => {
        service = new AppService();
    });

    it('should init the controller', () => {
        return expect(service).to.not.be.undefined;
    });

    describe('validate', () => {
        it('should call appService.mergeAndSortData, appService.flagDuplicates and appService.checkForErrors with correct params and return', () => {
            stub(service, 'mergeAndSortData').returns([{some: 'merged data'}]);
            stub(service, 'flagDuplicates').returns([{some: 'flagged data'}]);
            stub(service, 'checkForErrors').returns({some: 'reasons'});
            const res = service.validate([{some: 'data'}] as any);
            return (expect(service.mergeAndSortData) as any).to.have.been.calledWith([{some: 'data'}])
                && (expect(service.flagDuplicates) as any).to.have.been.calledWith([{some: 'merged data'}])
                && (expect(service.checkForErrors) as any).to.have.been.calledWith([{some: 'flagged data'}])
                && (expect(res) as any).to.be.deep.eq({result: 'ok', reasons: {some: 'reasons'}});
        });
    });

    describe('mergeAndSortData', () => {
        it('should merge and sort correctly', () => {
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
            const res = service.mergeAndSortData(mockedData);
            return (expect(res) as any).to.be.deep.eq([
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

    describe('flagDuplicates', () => {
        it('should flag duplicates correctly', () => {
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
            const res = service.flagDuplicates(mockedData);
            return (expect(res) as any).to.be.deep.eq([
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

    describe('checkForErrors', () => {
        it('should detect balance errors correctly', () => {
            const mockedData = [
                {"id": 1, "date": "2023-01-23 10:00:00", "label": "First movement", "amount": 10},
                {"id": 3, "date": "2023-01-23 10:10:00", "label": "Third movement", "amount": 50},
                {"id": 2, "date": "2023-01-23 10:05:00", "label": "Second movement", "amount": 20},
                {"date": "2023-01-24 00:00:00", "balance": 60}
            ];
            const res = service.checkForErrors(mockedData);
            return (expect(res) as any).to.be.deep.eq({
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

        it('should detect duplicate errors correctly', () => {
            const mockedData = [
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30},
                {"id": 4, "date": "2023-01-24 10:00:00", "label": "Fourth movement", "amount": 10},
                {"id": 5, "date": "2023-01-25 10:10:00", "label": "Fifth movement", "amount": 30, "isDuplicate": true},
                {"id": 6, "date": "2023-01-25 10:05:00", "label": "Sixth movement", "amount": 20},
                {"date": "2023-01-26 00:00:00", "balance": 60},
                {"date": "2023-01-26 00:00:00", "balance": 60, "isDuplicate": true}
            ];
            const res = service.checkForErrors(mockedData);
            return (expect(res) as any).to.be.deep.eq({
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
    });

    describe('buildErrorObject', () => {
        it('should return null if no error given', () => {
            const mockedBalanceErrors = [] as any;
            const mockedDuplicateErrors = {balances: [], movements: []} as any;
            const res = service.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            return (expect(res) as any).to.be.deep.eq(null);
        });

        it('should build reasons object with only balances if only balance errors', () => {
            const mockedBalanceErrors = [{some: 'balance error'}] as any;
            const mockedDuplicateErrors = {balances: [], movements: []} as any;
            const res = service.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            return (expect(res) as any).to.be.deep.eq({
                balances: [{some: 'balance error'}]
            });
        });

        it('should build reasons object with only duplicates if only duplicate errors', () => {
            const mockedBalanceErrors = [] as any;
            const mockedDuplicateErrors = {balances: [{some: 'duplicate balance'}], movements: [{some: 'duplicate movement'}]} as any;
            const res = service.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            return (expect(res) as any).to.be.deep.eq({
                duplicates: {
                    balances: [{some: 'duplicate balance'}],
                    movements: [{some: 'duplicate movement'}]
                }
            });
        });

        it('should build reasons object correctly', () => {
            const mockedBalanceErrors = [{some: 'balance error'}] as any;
            const mockedDuplicateErrors = {balances: [{some: 'duplicate balance'}], movements: [{some: 'duplicate movement'}]} as any;
            const res = service.buildErrorObject(mockedBalanceErrors, mockedDuplicateErrors);
            return (expect(res) as any).to.be.deep.eq({
                balances: [{some: 'balance error'}],
                duplicates: {
                    balances: [{some: 'duplicate balance'}],
                    movements: [{some: 'duplicate movement'}]
                }
            });
        });
    })

});
