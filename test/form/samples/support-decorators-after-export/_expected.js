@decorator
@decorator2
class AfterExport {}

@decorator
class AfterDefaultExport {}

export { AfterExport, AfterDefaultExport as default };
