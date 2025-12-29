import UIKit

func getAppMemoryUsage() -> Double? {
    var info = task_vm_info_data_t()
    var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size) / 4

    let result: kern_return_t = withUnsafeMutablePointer(to: &info) {
        $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
            task_info(mach_task_self_, task_flavor_t(TASK_VM_INFO), $0, &count)
        }
    }

    if result == KERN_SUCCESS {
        let memoryUsageInBytes = info.phys_footprint
        let memoryUsageInMB = Double(memoryUsageInBytes) / (1024 * 1024)
        return Double(round(100 * memoryUsageInMB) / 100)
    } else {
        return nil
    }
}