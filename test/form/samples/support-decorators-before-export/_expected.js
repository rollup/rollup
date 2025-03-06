@decorator
class BeforeExport {}

@decorator
@decorator2
class BeforeDefaultExport {}

export { BeforeExport, BeforeDefaultExport as default };
